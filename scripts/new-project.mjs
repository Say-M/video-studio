#!/usr/bin/env node
// Scaffold a new video project in all three places and register it in Studio.
//
//   node scripts/new-project.mjs <slug> --client <client> [--title "..."] [--type feature-launch]
//        [--formats 16x9,9x16,1x1,4k] [--language en] [--duration 60] [--fps 30]
//
// Creates:
//   projects/<slug>/          brief.md, script.md, project.json, references/, feedback/, renders/
//   src/projects/<slug>/      Remotion code (from templates/src)
//   public/projects/<slug>/   vo/, music/, sfx/, screens/, recordings/
//   clients/<client>/         brand.json + notes.md (if the client is new)
// and adds the project's compositions to src/Root.tsx.

import {cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fail, parseArgs, paths, ROOT, toPascal, writeJson} from './lib.mjs';

const args = parseArgs();
const slug = args._[0];
if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) fail('Slug must be lowercase letters, numbers and hyphens, e.g. acme-reports-launch');
const client = typeof args.client === 'string' ? args.client : fail('Pass --client <client-slug> (existing folder in clients/ or a new one).');
if (!/^[a-z0-9][a-z0-9-]*$/.test(client)) fail('Client slug must be lowercase letters, numbers and hyphens.');

const p = paths(slug);
if (existsSync(p.docs) || existsSync(p.src)) fail(`Project "${slug}" already exists.`);

const title = typeof args.title === 'string' ? args.title : slug.replace(/-/g, ' ');
const type = typeof args.type === 'string' ? args.type : 'feature-launch';
const language = typeof args.language === 'string' ? args.language : 'en';
const duration = Number(args.duration ?? 60);
const fps = Number(args.fps ?? 30);
const formats = String(args.formats ?? '16x9')
	.split(',')
	.map((f) => f.trim())
	.filter(Boolean);
const valid = ['16x9', '9x16', '1x1', '4k'];
for (const f of formats) if (!valid.includes(f)) fail(`Unknown format "${f}". Use ${valid.join(', ')}.`);
const pascal = toPascal(slug);

const replace = (s) =>
	s
		.replaceAll('__SLUG__', slug)
		.replaceAll('__PASCAL__', pascal)
		.replaceAll('__CLIENT__', client)
		.replaceAll('__TITLE__', title)
		.replaceAll('__TYPE__', type)
		.replaceAll('__LANGUAGE__', language)
		.replaceAll('__DURATION__', String(duration))
		.replaceAll('__FORMATS__', formats.join(', '));

const copyTemplate = (from, to) => {
	mkdirSync(to, {recursive: true});
	for (const entry of readdirSync(from)) {
		const src = path.join(from, entry);
		const dst = path.join(to, entry);
		if (statSync(src).isDirectory()) copyTemplate(src, dst);
		else writeFileSync(dst, replace(readFileSync(src, 'utf8')));
	}
};

// 1. Client
const clientDir = path.join(ROOT, 'clients', client);
if (!existsSync(clientDir)) {
	mkdirSync(clientDir, {recursive: true});
	cpSync(path.join(ROOT, 'clients', 'demo', 'brand.json'), path.join(clientDir, 'brand.json'));
	const brand = JSON.parse(readFileSync(path.join(clientDir, 'brand.json'), 'utf8'));
	brand.name = client;
	delete brand.logo;
	writeJson(path.join(clientDir, 'brand.json'), brand);
	writeFileSync(
		path.join(clientDir, 'notes.md'),
		`# ${client}\n\nBrand kit: brand.json (colors, fonts, radius). Logos & fonts: public/clients/${client}/\n\n## Voice & tone\n- Preferred VO provider / voice id:\n- Tone:\n\n## Do / Don't\n-\n\n## Past projects\n- ${slug}\n`,
	);
	mkdirSync(path.join(ROOT, 'public', 'clients', client), {recursive: true});
	console.log(`  + clients/${client}/ (new client — fill brand.json with the brand-kit skill)`);
} else {
	const notes = path.join(clientDir, 'notes.md');
	if (existsSync(notes)) writeFileSync(notes, readFileSync(notes, 'utf8').trimEnd() + `\n- ${slug}\n`);
}

// 2. Docs
copyTemplate(path.join(ROOT, 'templates', 'docs'), p.docs);
for (const d of ['references', 'feedback', 'renders']) mkdirSync(path.join(p.docs, d), {recursive: true});
writeJson(p.projectJson, {
	slug,
	title,
	client,
	type,
	language,
	formats,
	fps,
	targetDuration: duration,
	stage: 'intake',
	approvals: {script: null, preview: null, final: null},
	voice: {provider: 'elevenlabs', voiceId: '', model: '', speed: 1, language},
	music: {prompt: '', file: null},
	revision: 0,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
});
writeJson(p.voiceoverJson, {
	scenes: [
		{id: 's01-hook', text: ''},
		{id: 's02-demo', text: ''},
		{id: 's03-cta', text: ''},
	],
});

// 3. Source
copyTemplate(path.join(ROOT, 'templates', 'src'), p.src);
const sizes = {'16x9': [1920, 1080], '9x16': [1080, 1920], '1x1': [1080, 1080]};
const comps = [...new Set(formats.map((f) => (f === '4k' ? '16x9' : f)))];
const compJsx = comps
	.map(
		(f) => `		<Composition
			id="${slug}-${f}"
			component={${pascal}}
			width={${sizes[f][0]}}
			height={${sizes[f][1]}}
			fps={${fps}}
			durationInFrames={${duration * fps}}
			calculateMetadata={calculateMetadata}
		/>`,
	)
	.join('\n');
writeFileSync(
	path.join(p.src, 'Compositions.tsx'),
	`import React from 'react';
import {Composition, Folder, type CalculateMetadataFunction} from 'remotion';
import {buildTimeline, totalFrames} from '../../library';
import {FPS, PLAN, TIMINGS, TRANSITION} from './plan';
import {${pascal}} from './Video';

// Duration follows the voice-over: regenerate VO and the video re-times itself.
const calculateMetadata: CalculateMetadataFunction<Record<string, unknown>> = () => ({
	durationInFrames: totalFrames(buildTimeline(PLAN, TIMINGS, FPS), TRANSITION),
});

/** Composition ids: <slug>-<format>. 4K = render the 16x9 one with --scale=2. */
export const ${pascal}Compositions: React.FC = () => (
	<Folder name="${slug}">
${compJsx}
	</Folder>
);
`,
);
if (fps !== 30) {
	const plan = path.join(p.src, 'plan.ts');
	writeFileSync(plan, readFileSync(plan, 'utf8').replace('export const FPS = 30;', `export const FPS = ${fps};`));
}

// 4. Public media folders
for (const d of ['vo', 'music', 'sfx', 'screens', 'recordings']) mkdirSync(path.join(p.public, d), {recursive: true});
writeFileSync(path.join(p.public, 'recordings', '.gitkeep'), '');

// 5. Register in Root.tsx
const rootFile = path.join(ROOT, 'src', 'Root.tsx');
let root = readFileSync(rootFile, 'utf8');
root = root.replace('// @projects-imports-end', `import {${pascal}Compositions} from './projects/${slug}/Compositions';\n// @projects-imports-end`);
root = root.replace(/(\s*)\{\/\* @projects-jsx-end \*\/\}/, `$1<${pascal}Compositions />$1{/* @projects-jsx-end */}`);
writeFileSync(rootFile, root);

console.log(`✔ Created project "${slug}" for client "${client}"
  docs:   projects/${slug}/  (brief.md, script.md, voiceover.json, project.json)
  code:   src/projects/${slug}/
  media:  public/projects/${slug}/
  Studio compositions: ${comps.map((f) => `${slug}-${f}`).join(', ')}`);
