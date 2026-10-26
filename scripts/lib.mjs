// Shared helpers for the studio scripts. Node >= 20, no dependencies.
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Remotion CLI entry, run with the current node binary (avoids npx/shell quirks on Windows). */
export const REMOTION_CLI = path.join(ROOT, 'node_modules', '@remotion', 'cli', 'remotion-cli.js');

/** Run `remotion <args>` with inherited output; returns the exit code. */
export const runRemotion = (args) => spawnSync(process.execPath, [REMOTION_CLI, ...args], {cwd: ROOT, stdio: 'inherit'}).status;

export const paths = (slug) => ({
	docs: path.join(ROOT, 'projects', slug),
	projectJson: path.join(ROOT, 'projects', slug, 'project.json'),
	voiceoverJson: path.join(ROOT, 'projects', slug, 'voiceover.json'),
	src: path.join(ROOT, 'src', 'projects', slug),
	timings: path.join(ROOT, 'src', 'projects', slug, 'vo-timings.json'),
	public: path.join(ROOT, 'public', 'projects', slug),
	publicRel: `projects/${slug}`,
	renders: path.join(ROOT, 'projects', slug, 'renders'),
	assetsLog: path.join(ROOT, 'projects', slug, 'assets-log.md'),
});

export const loadEnv = () => {
	const file = path.join(ROOT, '.env');
	if (existsSync(file) && typeof process.loadEnvFile === 'function') {
		process.loadEnvFile(file);
	}
};

export const requireEnv = (name, hint) => {
	const v = process.env[name];
	if (!v) {
		fail(`${name} is not set. Add it to .env (see .env.example).${hint ? ` ${hint}` : ''}`);
	}
	return v;
};

/** Minimal argv parser: positional args + --flag value / --flag (boolean) / --flag=value. */
export const parseArgs = (argv = process.argv.slice(2)) => {
	const args = {_: []};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a.startsWith('--')) {
			const [key, inline] = a.slice(2).split(/=(.*)/s);
			if (inline !== undefined) {
				args[key] = inline;
			} else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) {
				args[key] = argv[++i];
			} else {
				args[key] = true;
			}
		} else {
			args._.push(a);
		}
	}
	return args;
};

export const readJson = (file, fallback) => {
	if (!existsSync(file)) {
		if (fallback !== undefined) return fallback;
		fail(`Missing file: ${path.relative(ROOT, file)}`);
	}
	return JSON.parse(readFileSync(file, 'utf8').replace(/^﻿/, ''));
};

export const writeJson = (file, data) => {
	mkdirSync(path.dirname(file), {recursive: true});
	writeFileSync(file, JSON.stringify(data, null, '\t') + '\n');
};

export const fail = (msg) => {
	console.error(`\n✖ ${msg}\n`);
	process.exit(1);
};

export const requireProject = (slug) => {
	if (!slug) fail('Pass the project slug as the first argument.');
	const p = paths(slug);
	if (!existsSync(p.projectJson)) fail(`Project "${slug}" not found (expected ${path.relative(ROOT, p.projectJson)}).`);
	return {p, project: readJson(p.projectJson)};
};

export const touchProject = (slug, patch = {}) => {
	const p = paths(slug);
	const project = readJson(p.projectJson);
	Object.assign(project, patch, {updatedAt: new Date().toISOString()});
	writeJson(p.projectJson, project);
	return project;
};

/** Run ffmpeg/ffprobe: prefers a system install, falls back to Remotion's bundled binaries. */
export const runFf = (tool, args, {encoding = 'utf8', maxBuffer = 1024 * 1024 * 512} = {}) => {
	const system = spawnSync(tool, ['-version'], {encoding: 'utf8', shell: false});
	const useSystem = system.status === 0;
	const cmd = useSystem ? tool : process.execPath;
	const fullArgs = useSystem ? args : [REMOTION_CLI, tool, ...args];
	const res = spawnSync(cmd, fullArgs, {cwd: ROOT, encoding, maxBuffer});
	if (res.status !== 0) {
		const err = Buffer.isBuffer(res.stderr) ? res.stderr.toString() : res.stderr;
		throw new Error(`${tool} failed: ${err || res.error}`);
	}
	return res.stdout;
};

export const probeDuration = (file) => {
	const out = runFf('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file]);
	return parseFloat(String(out).trim());
};

export const appendLog = (slug, line) => {
	const file = paths(slug).assetsLog;
	const prev = existsSync(file) ? readFileSync(file, 'utf8') : '# Generated assets log\n\nEvery generated voice/music/SFX file with the settings used — for reproducing or tweaking later.\n\n';
	writeFileSync(file, `${prev}- ${new Date().toISOString().slice(0, 16).replace('T', ' ')} — ${line}\n`);
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export const toPascal = (slug) =>
	slug
		.split(/[^a-zA-Z0-9]+/)
		.filter(Boolean)
		.map((w) => w[0].toUpperCase() + w.slice(1))
		.join('')
		.replace(/^(\d)/, 'P$1');
