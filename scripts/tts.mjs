#!/usr/bin/env node
// Voice-over generation: ElevenLabs or Cartesia, one audio file per scene,
// with word-level timestamps written to src/projects/<slug>/vo-timings.json.
//
//   node scripts/tts.mjs <slug>                       generate changed/missing lines
//   node scripts/tts.mjs <slug> --scene s02-generate  only these scenes (comma-separated)
//   node scripts/tts.mjs <slug> --force               regenerate everything
//   node scripts/tts.mjs <slug> --provider cartesia --voice <id>   override project.json
//   node scripts/tts.mjs <slug> --dry-run             show what would be generated
//
// Input:  projects/<slug>/voiceover.json  {"scenes":[{"id":"s01-hook","text":"..."}]}
// Voice:  project.json "voice": {provider, voiceId, model, speed, language, stability, similarity, style, emotion}
// Unchanged lines (same text + voice settings) are skipped, so revisions only pay for what changed.

import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {appendLog, fail, loadEnv, parseArgs, probeDuration, readJson, requireEnv, requireProject, ROOT, touchProject, writeJson} from './lib.mjs';

loadEnv();
const args = parseArgs();
const slug = args._[0];
const {p, project} = requireProject(slug);

const vo = readJson(p.voiceoverJson);
const voice = {...(project.voice ?? {})};
if (args.provider) voice.provider = args.provider;
if (args.voice) voice.voiceId = args.voice;
if (args.model) voice.model = args.model;
if (args.speed) voice.speed = Number(args.speed);
voice.provider ??= 'elevenlabs';

const isEleven = voice.provider === 'elevenlabs';
if (!isEleven && voice.provider !== 'cartesia') fail(`Unknown provider "${voice.provider}" (use elevenlabs or cartesia).`);

voice.voiceId ||= isEleven ? process.env.ELEVENLABS_DEFAULT_VOICE_ID : process.env.CARTESIA_DEFAULT_VOICE_ID;
voice.model ||= isEleven ? process.env.ELEVENLABS_DEFAULT_MODEL || 'eleven_multilingual_v2' : process.env.CARTESIA_DEFAULT_MODEL || 'sonic-3.6';
if (!voice.voiceId) fail(`No voice id. Set project.json voice.voiceId, pass --voice, or set a default in .env. List voices: node scripts/voices.mjs --provider ${voice.provider}`);

const only = args.scene ? String(args.scene).split(',').map((s) => s.trim()) : null;
const existing = readJson(p.timings, {scenes: []});
const byId = new Map(existing.scenes.map((s) => [s.id, s]));
const outDir = path.join(p.public, 'vo');
mkdirSync(outDir, {recursive: true});

const hashOf = (text) =>
	createHash('sha1')
		.update(JSON.stringify([voice.provider, voice.voiceId, voice.model, voice.speed ?? 1, voice.language ?? '', voice.stability, voice.similarity, voice.style, voice.emotion, text]))
		.digest('hex')
		.slice(0, 12);

// ---------- ElevenLabs ----------
const charsToWords = (alignment) => {
	const words = [];
	let cur = null;
	alignment.characters.forEach((ch, i) => {
		if (/\s/.test(ch)) {
			if (cur) words.push(cur);
			cur = null;
			return;
		}
		const start = alignment.character_start_times_seconds[i];
		const end = alignment.character_end_times_seconds[i];
		if (!cur) cur = {text: ch, start, end};
		else {
			cur.text += ch;
			cur.end = end;
		}
	});
	if (cur) words.push(cur);
	return words;
};

const elevenlabs = async (scene, index) => {
	const key = requireEnv('ELEVENLABS_API_KEY');
	const prev = vo.scenes[index - 1]?.text;
	const next = vo.scenes[index + 1]?.text;
	const body = {
		text: scene.text,
		model_id: voice.model,
		voice_settings: {
			stability: voice.stability ?? 0.5,
			similarity_boost: voice.similarity ?? 0.75,
			style: voice.style ?? 0,
			use_speaker_boost: true,
			speed: voice.speed ?? 1,
		},
		...(prev ? {previous_text: prev} : {}),
		...(next ? {next_text: next} : {}),
		// multilingual_v2 detects the language itself and rejects language_code.
		...(voice.language && !/multilingual_v2/.test(voice.model) ? {language_code: voice.language} : {}),
	};
	const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.voiceId}/with-timestamps?output_format=mp3_44100_128`, {
		method: 'POST',
		headers: {'xi-api-key': key, 'Content-Type': 'application/json'},
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
	const json = await res.json();
	const file = path.join(outDir, `${scene.id}.mp3`);
	writeFileSync(file, Buffer.from(json.audio_base64, 'base64'));
	const words = json.alignment ? charsToWords(json.alignment) : [];
	return {file, words};
};

// ---------- Cartesia ----------
const wavHeader = (dataBytes, sampleRate, channels = 1, bits = 16) => {
	const h = Buffer.alloc(44);
	h.write('RIFF', 0);
	h.writeUInt32LE(36 + dataBytes, 4);
	h.write('WAVE', 8);
	h.write('fmt ', 12);
	h.writeUInt32LE(16, 16);
	h.writeUInt16LE(1, 20);
	h.writeUInt16LE(channels, 22);
	h.writeUInt32LE(sampleRate, 24);
	h.writeUInt32LE((sampleRate * channels * bits) / 8, 28);
	h.writeUInt16LE((channels * bits) / 8, 32);
	h.writeUInt16LE(bits, 34);
	h.write('data', 36);
	h.writeUInt32LE(dataBytes, 40);
	return h;
};

const cartesia = async (scene) => {
	const key = requireEnv('CARTESIA_API_KEY');
	const sampleRate = 44100;
	const body = {
		model_id: voice.model,
		transcript: scene.text,
		voice: {id: voice.voiceId},
		output_format: {container: 'raw', encoding: 'pcm_s16le', sample_rate: sampleRate},
		language: voice.language ?? 'en',
		add_timestamps: true,
		generation_config: {speed: voice.speed ?? 1, ...(voice.emotion ? {emotion: voice.emotion} : {})},
	};
	const res = await fetch('https://api.cartesia.ai/tts/sse', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${key}`,
			'X-API-Key': key,
			'Cartesia-Version': process.env.CARTESIA_VERSION || '2026-08-14',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(`Cartesia ${res.status}: ${await res.text()}`);
	const text = await res.text();
	const chunks = [];
	const words = [];
	for (const block of text.split(/\r?\n\r?\n/)) {
		const data = block
			.split(/\r?\n/)
			.filter((l) => l.startsWith('data:'))
			.map((l) => l.slice(5).trim())
			.join('');
		if (!data) continue;
		const ev = JSON.parse(data);
		if (ev.type === 'error') throw new Error(`Cartesia: ${ev.title ?? ''} ${ev.message ?? data}`);
		if (ev.type === 'chunk' && ev.data) chunks.push(Buffer.from(ev.data, 'base64'));
		if (ev.type === 'timestamps' && ev.word_timestamps) {
			const w = ev.word_timestamps;
			w.words.forEach((word, i) => words.push({text: word, start: w.start[i], end: w.end[i]}));
		}
	}
	const pcm = Buffer.concat(chunks);
	if (pcm.length === 0) throw new Error('Cartesia returned no audio.');
	const file = path.join(outDir, `${scene.id}.wav`);
	writeFileSync(file, Buffer.concat([wavHeader(pcm.length, sampleRate), pcm]));
	return {file, words};
};

// ---------- main ----------
const results = [];
let generated = 0;
for (const [i, scene] of vo.scenes.entries()) {
	if (!scene.text?.trim()) continue;
	const hash = hashOf(scene.text);
	const prev = byId.get(scene.id);
	const wanted = only ? only.includes(scene.id) : true;
	const fresh = prev && prev.hash === hash && existsSync(path.join(ROOT, 'public', prev.file));
	if (!wanted || (fresh && !args.force)) {
		if (prev) results.push(prev);
		console.log(`  · ${scene.id.padEnd(22)} ${fresh ? 'unchanged' : 'skipped (not selected)'}`);
		continue;
	}
	if (args['dry-run']) {
		console.log(`  → ${scene.id.padEnd(22)} would generate (${scene.text.length} chars)`);
		if (prev) results.push(prev);
		continue;
	}
	process.stdout.write(`  → ${scene.id.padEnd(22)} generating… `);
	try {
		const {file, words} = isEleven ? await elevenlabs(scene, i) : await cartesia(scene);
		const duration = probeDuration(file);
		const rel = path.relative(path.join(ROOT, 'public'), file).split(path.sep).join('/');
		results.push({id: scene.id, file: rel, duration: Math.round(duration * 1000) / 1000, words, text: scene.text, hash});
		generated++;
		console.log(`${duration.toFixed(2)}s, ${words.length} words`);
		appendLog(slug, `VO ${scene.id}: ${voice.provider}/${voice.model} voice=${voice.voiceId} speed=${voice.speed ?? 1} → public/${rel} (${duration.toFixed(2)}s)`);
	} catch (e) {
		console.log('failed');
		fail(e.message);
	}
}

if (!args['dry-run']) {
	writeJson(p.timings, {provider: voice.provider, voice: voice.voiceId, model: voice.model, scenes: results});
	const total = results.reduce((s, r) => s + r.duration, 0);
	touchProject(slug, {voice});
	console.log(`\n✔ ${generated} line(s) generated. VO total ${total.toFixed(1)}s → ${path.relative(ROOT, p.timings)}`);
}
