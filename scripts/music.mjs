#!/usr/bin/env node
// Background music and sound effects with Stable Audio (Stability AI API).
//
//   node scripts/music.mjs <slug> --prompt "..." [--duration 60] [--name main] [--seed 123]
//   node scripts/music.mjs <slug> --sfx --prompt "soft UI click" --duration 1 --name click
//
// --duration defaults to the voice-over length + 4s (or 60s if there is no VO yet).
// Output: public/projects/<slug>/music/<name>.mp3 (or sfx/<name>.mp3 with --sfx).
// The async job is polled until finished. Every generation is logged in projects/<slug>/assets-log.md.

import {mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {appendLog, fail, loadEnv, parseArgs, readJson, requireEnv, requireProject, ROOT, sleep, touchProject} from './lib.mjs';

loadEnv();
const args = parseArgs();
const slug = args._[0];
const {p, project} = requireProject(slug);
const key = requireEnv('STABILITY_API_KEY');

if (typeof args.prompt !== 'string') fail('Pass --prompt "..." (see the video-music skill for prompt recipes).');
const sfx = Boolean(args.sfx);
const prompt = sfx && !/TrackType:/i.test(args.prompt) ? `TrackType: SFX, ${args.prompt}` : args.prompt;

const timings = readJson(p.timings, {scenes: []});
const voTotal = timings.scenes.reduce((s, x) => s + (x.duration ?? 0), 0);
const duration = Math.min(380, Math.max(1, Number(args.duration ?? (voTotal ? Math.ceil(voTotal + 4) : 60))));
const name = typeof args.name === 'string' ? args.name : sfx ? 'sfx' : 'main';
const format = args.wav ? 'wav' : 'mp3';

const form = new FormData();
form.append('prompt', prompt);
form.append('duration', String(duration));
form.append('output_format', format);
if (args.seed) form.append('seed', String(args.seed));
if (args.steps) form.append('steps', String(args.steps));
if (args.cfg) form.append('cfg_scale', String(args.cfg));

const headers = {Authorization: `Bearer ${key}`, Accept: 'audio/*'};
console.log(`→ Stable Audio: ${duration}s ${sfx ? 'SFX' : 'music'} "${prompt.slice(0, 90)}${prompt.length > 90 ? '…' : ''}"`);
const start = await fetch('https://api.stability.ai/v2beta/audio/stable-audio/text-to-audio', {method: 'POST', headers, body: form});
if (start.status !== 202 && start.status !== 200) fail(`Stability ${start.status}: ${await start.text()}`);

let audio;
if (start.status === 200 && (start.headers.get('content-type') ?? '').startsWith('audio')) {
	audio = Buffer.from(await start.arrayBuffer());
} else {
	const {id} = await start.json();
	process.stdout.write(`  job ${id} `);
	for (let i = 0; i < 120; i++) {
		await sleep(5000);
		const res = await fetch(`https://api.stability.ai/v2beta/audio/results/${id}`, {headers});
		if (res.status === 202) {
			process.stdout.write('.');
			continue;
		}
		if (res.status !== 200) fail(`Stability ${res.status}: ${await res.text()}`);
		audio = Buffer.from(await res.arrayBuffer());
		break;
	}
	console.log('');
	if (!audio) fail('Timed out waiting for Stable Audio (10 min). Re-run later.');
}

const dir = path.join(p.public, sfx ? 'sfx' : 'music');
mkdirSync(dir, {recursive: true});
const file = path.join(dir, `${name}.${format}`);
writeFileSync(file, audio);
const rel = path.relative(path.join(ROOT, 'public'), file).split(path.sep).join('/');
appendLog(slug, `${sfx ? 'SFX' : 'Music'} "${name}" ${duration}s seed=${args.seed ?? 'random'} → public/${rel}\n  prompt: ${prompt}`);
if (!sfx) touchProject(slug, {music: {...(project.music ?? {}), prompt, file: rel, duration}});
console.log(`✔ Saved public/${rel}\n  Use in code: staticFile('${rel}')`);
