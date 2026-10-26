#!/usr/bin/env node
// Extract frames from a reference video (or screen recording) so Claude can
// study it: shot list with cut detection + evenly spaced samples.
//
//   node scripts/frames.mjs <video> [--out dir] [--every 2] [--threshold 0.18] [--width 960] [--max 60]
//   node scripts/frames.mjs <video> --project <slug>   → projects/<slug>/references/frames/<video-name>/
//
// Writes:  cut-XXX_<time>.jpg   first frame of every detected shot
//          s-XXX_<time>.jpg     a sample every --every seconds
//          index.md             shot list with timestamps and durations (pacing)

import {existsSync, mkdirSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fail, parseArgs, probeDuration, ROOT, runFf} from './lib.mjs';

const args = parseArgs();
const input = args._[0];
if (!input || !existsSync(input)) fail('Pass the path of a video file.');

const name = path.basename(input).replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9-_]+/g, '-');
const out = path.resolve(
	typeof args.out === 'string' ? args.out : args.project ? path.join(ROOT, 'projects', args.project, 'references', 'frames', name) : path.join(ROOT, 'out', 'frames', name),
);
mkdirSync(out, {recursive: true});

const every = Number(args.every ?? 2);
const threshold = Number(args.threshold ?? 0.18);
const width = Number(args.width ?? 960);
const max = Number(args.max ?? 60);
const duration = probeDuration(input);

// 1) Cut detection: pipe tiny grayscale frames at 6 fps and diff them.
const SAMPLE_FPS = 6;
const W = 48;
const H = 27;
const raw = runFf('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-i', input, '-an', '-r', String(SAMPLE_FPS), '-vf', `scale=${W}:${H}`, '-f', 'image2pipe', '-c:v', 'rawvideo', '-pix_fmt', 'gray', '-'], {encoding: 'buffer'});
const size = W * H;
const count = Math.floor(raw.length / size);
const cuts = [0];
for (let i = 1; i < count; i++) {
	let diff = 0;
	for (let j = 0; j < size; j++) diff += Math.abs(raw[i * size + j] - raw[(i - 1) * size + j]);
	const score = diff / size / 255;
	const t = i / SAMPLE_FPS;
	if (score > threshold && t - cuts[cuts.length - 1] > 0.4) cuts.push(t);
}

const fmt = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}m${(t % 60).toFixed(1).padStart(4, '0')}s`;
const grab = (t, file) =>
	runFf('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-ss', t.toFixed(2), '-i', input, '-frames:v', '1', '-vf', `scale=${width}:-2`, '-q:v', '3', '-y', path.join(out, file)]);

// 2) First frame of each shot (+0.15s to skip transition blends).
const shots = cuts.slice(0, max).map((t, i) => {
	const end = cuts[i + 1] ?? duration;
	const file = `cut-${String(i + 1).padStart(3, '0')}_${fmt(t)}.jpg`;
	grab(Math.min(t + 0.15, duration - 0.05), file);
	return {i: i + 1, t, len: end - t, file};
});

// 3) Evenly spaced samples (catches motion within long shots).
const samples = [];
for (let t = every / 2; t < duration && samples.length < max; t += every) {
	const file = `s-${String(samples.length + 1).padStart(3, '0')}_${fmt(t)}.jpg`;
	grab(t, file);
	samples.push({t, file});
}

const avg = shots.reduce((s, x) => s + x.len, 0) / Math.max(1, shots.length);
const md = [
	`# Frames: ${path.basename(input)}`,
	'',
	`Duration ${duration.toFixed(1)}s · ${shots.length} shots · average shot ${avg.toFixed(1)}s · cut threshold ${threshold}`,
	'',
	'## Shot list',
	'',
	'| # | Start | Length | Frame |',
	'|---|---|---|---|',
	...shots.map((s) => `| ${s.i} | ${fmt(s.t)} | ${s.len.toFixed(1)}s | ${s.file} |`),
	'',
	`## Samples (every ${every}s)`,
	'',
	...samples.map((s) => `- ${fmt(s.t)} — ${s.file}`),
	'',
].join('\n');
writeFileSync(path.join(out, 'index.md'), md);
console.log(`✔ ${shots.length} shots, ${samples.length} samples → ${path.relative(ROOT, out)}`);
