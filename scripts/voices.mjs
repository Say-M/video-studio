#!/usr/bin/env node
// List and audition voices.
//
//   node scripts/voices.mjs --provider elevenlabs [--search "british"]
//   node scripts/voices.mjs --provider cartesia   [--search "narrator"]
//   node scripts/voices.mjs --provider elevenlabs --sample <voiceId> [--text "..."] [--model ...]
//
// Samples are written to out/voice-samples/ so you can listen before choosing.

import {mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fail, loadEnv, parseArgs, requireEnv, ROOT} from './lib.mjs';

loadEnv();
const args = parseArgs();
const provider = args.provider ?? 'elevenlabs';
const search = typeof args.search === 'string' ? args.search.toLowerCase() : null;
const sampleText =
	typeof args.text === 'string'
		? args.text
		: 'Meet Smart Reports. Just open your dashboard, click Generate, and get a clear summary of your quarter in seconds.';

const matches = (s) => !search || s.toLowerCase().includes(search);

if (provider === 'elevenlabs') {
	const key = requireEnv('ELEVENLABS_API_KEY');
	if (args.sample) {
		const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${args.sample}?output_format=mp3_44100_128`, {
			method: 'POST',
			headers: {'xi-api-key': key, 'Content-Type': 'application/json'},
			body: JSON.stringify({text: sampleText, model_id: args.model ?? process.env.ELEVENLABS_DEFAULT_MODEL ?? 'eleven_multilingual_v2'}),
		});
		if (!res.ok) fail(`ElevenLabs ${res.status}: ${await res.text()}`);
		const out = path.join(ROOT, 'out', 'voice-samples', `elevenlabs-${args.sample}.mp3`);
		mkdirSync(path.dirname(out), {recursive: true});
		writeFileSync(out, Buffer.from(await res.arrayBuffer()));
		console.log(`✔ Sample → ${path.relative(ROOT, out)}`);
	} else {
		const res = await fetch('https://api.elevenlabs.io/v1/voices', {headers: {'xi-api-key': key}});
		if (!res.ok) fail(`ElevenLabs ${res.status}: ${await res.text()}`);
		const {voices} = await res.json();
		for (const v of voices) {
			const labels = Object.values(v.labels ?? {}).join(', ');
			const line = `${v.voice_id}  ${v.name}  [${v.category ?? ''}] ${labels}`;
			if (matches(line)) console.log(line + (v.preview_url ? `\n    preview: ${v.preview_url}` : ''));
		}
	}
} else if (provider === 'cartesia') {
	const key = requireEnv('CARTESIA_API_KEY');
	const headers = {Authorization: `Bearer ${key}`, 'X-API-Key': key, 'Cartesia-Version': process.env.CARTESIA_VERSION || '2026-08-14'};
	if (args.sample) {
		const res = await fetch('https://api.cartesia.ai/tts/bytes', {
			method: 'POST',
			headers: {...headers, 'Content-Type': 'application/json'},
			body: JSON.stringify({
				model_id: args.model ?? process.env.CARTESIA_DEFAULT_MODEL ?? 'sonic-3.6',
				transcript: sampleText,
				voice: {id: args.sample},
				output_format: {container: 'mp3', sample_rate: 44100, bit_rate: 128000},
				language: args.language ?? 'en',
			}),
		});
		if (!res.ok) fail(`Cartesia ${res.status}: ${await res.text()}`);
		const out = path.join(ROOT, 'out', 'voice-samples', `cartesia-${args.sample}.mp3`);
		mkdirSync(path.dirname(out), {recursive: true});
		writeFileSync(out, Buffer.from(await res.arrayBuffer()));
		console.log(`✔ Sample → ${path.relative(ROOT, out)}`);
	} else {
		let url = 'https://api.cartesia.ai/voices?limit=100';
		const all = [];
		for (let page = 0; page < 10 && url; page++) {
			const res = await fetch(url, {headers});
			if (!res.ok) fail(`Cartesia ${res.status}: ${await res.text()}`);
			const json = await res.json();
			const list = Array.isArray(json) ? json : json.data ?? [];
			all.push(...list);
			url = !Array.isArray(json) && json.has_more && list.length ? `https://api.cartesia.ai/voices?limit=100&starting_after=${list[list.length - 1].id}` : null;
		}
		for (const v of all) {
			const line = `${v.id}  ${v.name}  [${v.language ?? ''}${v.gender ? ', ' + v.gender : ''}] ${(v.description ?? '').slice(0, 90)}`;
			if (matches(line)) console.log(line);
		}
	}
} else {
	fail('Use --provider elevenlabs or --provider cartesia');
}
