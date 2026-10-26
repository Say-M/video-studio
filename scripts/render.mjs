#!/usr/bin/env node
// Render deliverables for a project.
//
//   node scripts/render.mjs <slug>                    all formats in project.json, final quality
//   node scripts/render.mjs <slug> --formats 9x16,4k  specific formats
//   node scripts/render.mjs <slug> --draft            fast half-resolution preview render
//   node scripts/render.mjs <slug> --stills 0,150,300 PNG stills for review (per format)
//
// Output: projects/<slug>/renders/<slug>-<format>-v<N>[-draft].mp4  (version auto-increments)

import {existsSync, mkdirSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {fail, parseArgs, requireProject, ROOT, runRemotion, touchProject} from './lib.mjs';

const args = parseArgs();
const slug = args._[0];
const {p, project} = requireProject(slug);
const formats = String(args.formats ?? (project.formats ?? ['16x9']).join(','))
	.split(',')
	.map((s) => s.trim());
const draft = Boolean(args.draft);
mkdirSync(p.renders, {recursive: true});

const nextVersion = (fmt) => {
	// Finals are numbered v1, v2…; a draft carries the number the next final will get.
	const re = new RegExp(`^${slug}-${fmt}-v(\\d+)\\.mp4$`);
	const versions = readdirSync(p.renders)
		.map((f) => f.match(re)?.[1])
		.filter(Boolean)
		.map(Number);
	return (versions.length ? Math.max(...versions) : 0) + 1;
};

const run = (cliArgs) => {
	console.log(`\n$ npx remotion ${cliArgs.join(' ')}`);
	if (runRemotion(cliArgs) !== 0) fail('Render failed (see output above).');
};

const outputs = [];
for (const fmt of formats) {
	const comp = `${slug}-${fmt === '4k' ? '16x9' : fmt}`;
	const scale = fmt === '4k' ? 2 : draft ? 0.5 : 1;

	if (typeof args.stills === 'string') {
		const dir = path.join(p.renders, 'stills', fmt);
		mkdirSync(dir, {recursive: true});
		for (const frame of args.stills.split(',')) {
			run(['still', comp, path.join(dir, `f${frame.trim()}.png`), `--frame=${frame.trim()}`, '--log=error']);
		}
		outputs.push(path.relative(ROOT, dir));
		continue;
	}

	const v = nextVersion(fmt);
	const file = path.join(p.renders, `${slug}-${fmt}-v${v}${draft ? '-draft' : ''}.mp4`);
	const cli = ['render', comp, file, '--codec=h264', `--scale=${scale}`, `--crf=${draft ? 28 : 18}`, '--log=info'];
	if (!draft) cli.push('--image-format=png');
	run(cli);
	if (!existsSync(file)) fail(`Expected output missing: ${file}`);
	outputs.push(path.relative(ROOT, file));
}

if (!draft && typeof args.stills !== 'string') touchProject(slug, {stage: 'delivered', lastRender: outputs});
console.log(`\n✔ Done:\n${outputs.map((o) => `  ${o}`).join('\n')}`);
