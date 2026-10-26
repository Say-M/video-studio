#!/usr/bin/env node
// Studio dashboard: every project with its stage and next step.
// Also runs as a SessionStart hook so each new Claude session knows the state.
//
//   node scripts/status.mjs           table
//   node scripts/status.mjs --hook    compact context for Claude

import {existsSync, readdirSync} from 'node:fs';
import path from 'node:path';
import {parseArgs, readJson, ROOT} from './lib.mjs';

const args = parseArgs();
const NEXT = {
	intake: 'finish the brief (video-intake)',
	references: 'analyse references & inputs (video-reference)',
	script: 'write/revise script, get approval (video-script)',
	voiceover: 'generate voice-over (video-voiceover)',
	build: 'build scenes in Remotion (video-build)',
	review: 'internal QA + client preview (video-render --draft, video-feedback)',
	revisions: 'apply client feedback (video-feedback)',
	delivered: 'done — reopen for new revisions if needed',
};

const dir = path.join(ROOT, 'projects');
const projects = existsSync(dir)
	? readdirSync(dir)
			.filter((d) => existsSync(path.join(dir, d, 'project.json')))
			.map((d) => readJson(path.join(dir, d, 'project.json')))
			.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
	: [];

const env = existsSync(path.join(ROOT, '.env'));
const clients = existsSync(path.join(ROOT, 'clients')) ? readdirSync(path.join(ROOT, 'clients')) : [];

if (args.hook) {
	const lines = [
		'VIDEO STUDIO STATUS (auto-generated at session start)',
		`API keys file (.env): ${env ? 'present' : 'MISSING — copy .env.example to .env before generating voice/music'}`,
		`Clients: ${clients.join(', ') || 'none'}`,
		projects.length ? 'Projects (most recent first):' : 'Projects: none yet.',
		...projects.slice(0, 12).map((p) => `- ${p.slug} [${p.client}] stage=${p.stage} rev=${p.revision ?? 0} updated=${String(p.updatedAt).slice(0, 10)} → next: ${NEXT[p.stage] ?? '?'}`),
	];
	console.log(lines.join('\n'));
} else {
	if (!projects.length) {
		console.log('No projects yet. Start one: open a Claude session here and say "new video".');
	}
	for (const p of projects) {
		console.log(`${p.slug.padEnd(28)} ${String(p.client).padEnd(14)} ${String(p.stage).padEnd(11)} ${String(p.updatedAt).slice(0, 10)}  → ${NEXT[p.stage] ?? ''}`);
	}
	if (!env) console.log('\n! .env missing — copy .env.example to .env and add API keys.');
}
