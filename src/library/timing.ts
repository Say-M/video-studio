/**
 * Voice-over driven timing.
 *
 * scripts/tts.mjs writes src/projects/<slug>/vo-timings.json with one entry per
 * scene: the audio file, its duration and word-level timestamps. Scenes are
 * sized from those durations, and animations are cued to spoken words with
 * wordFrame(), so a re-generated voice line re-times its scene automatically.
 */

export type VoWord = {text: string; start: number; end: number};

export type VoScene = {
	id: string;
	/** Path relative to public/, use with staticFile() */
	file: string;
	/** Seconds */
	duration: number;
	words: VoWord[];
	text?: string;
	hash?: string;
	/** Playback speed of the audio file (set by withVoSpeed; duration and words are already scaled). */
	playbackRate?: number;
};

export type VoTimings = {
	provider?: string;
	voice?: string;
	scenes: VoScene[];
};

export type ScenePlanItem = {
	id: string;
	/** Used when the scene has no voice-over yet (or never will). */
	fallbackSeconds: number;
	/** Silence before the VO starts inside the scene. */
	padBefore?: number;
	/** Hold after the VO ends. Keep >= the transition length so VO never overlaps the next scene. */
	padAfter?: number;
	/** Never shorter than this, even if the VO is short. */
	minSeconds?: number;
};

export type TimedScene = {
	id: string;
	durationInFrames: number;
	/** Frame inside the scene where the VO starts. */
	voOffset: number;
	vo: VoScene | undefined;
};

/**
 * Plays every VO line faster (speed > 1) or slower without regenerating audio:
 * durations and word times are scaled, and SceneVoice plays the file at that rate
 * (pitch preserved). Scene lengths and wordFrame() cues follow automatically.
 */
export const withVoSpeed = (timings: VoTimings, speed: number): VoTimings =>
	speed === 1
		? timings
		: {
				...timings,
				scenes: timings.scenes.map((s) => ({
					...s,
					duration: s.duration / speed,
					playbackRate: speed,
					words: s.words.map((w) => ({...w, start: w.start / speed, end: w.end / speed})),
				})),
			};

const DEFAULT_PAD_BEFORE = 0.3;
const DEFAULT_PAD_AFTER = 0.6;

export const findVo = (timings: VoTimings | undefined, id: string) =>
	timings?.scenes.find((s) => s.id === id);

/** Turns the scene plan + VO timings into frame durations. */
export const buildTimeline = (
	plan: ScenePlanItem[],
	timings: VoTimings | undefined,
	fps: number,
): TimedScene[] =>
	plan.map((item) => {
		const vo = findVo(timings, item.id);
		const padBefore = item.padBefore ?? DEFAULT_PAD_BEFORE;
		const padAfter = item.padAfter ?? DEFAULT_PAD_AFTER;
		const seconds = vo
			? Math.max(padBefore + vo.duration + padAfter, item.minSeconds ?? 0)
			: Math.max(item.fallbackSeconds, item.minSeconds ?? 0);
		return {
			id: item.id,
			durationInFrames: Math.ceil(seconds * fps),
			voOffset: vo ? Math.round(padBefore * fps) : 0,
			vo,
		};
	});

/** Total length of a TransitionSeries: sum of scenes minus transition overlaps. */
export const totalFrames = (scenes: TimedScene[], transitionFrames = 0) =>
	scenes.reduce((sum, s) => sum + s.durationInFrames, 0) -
	Math.max(0, scenes.length - 1) * transitionFrames;

export const getScene = (scenes: TimedScene[], id: string) => {
	const scene = scenes.find((s) => s.id === id);
	if (!scene) {
		throw new Error(`Scene "${id}" is not in the scene plan`);
	}
	return scene;
};

const normalize = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');

/**
 * Frame (relative to the scene start) where `word` is spoken.
 * `word` may be a phrase ("click save"); its first word is matched in sequence.
 * Falls back to `fallbackSeconds` when there is no VO yet, so scenes still work
 * before the voice-over exists.
 */
export const wordFrame = (
	scene: TimedScene,
	word: string,
	fps: number,
	{occurrence = 1, fallbackSeconds = 0, edge = 'start'}: {occurrence?: number; fallbackSeconds?: number; edge?: 'start' | 'end'} = {},
) => {
	const words = scene.vo?.words ?? [];
	const target = word.split(/\s+/).map(normalize).filter(Boolean);
	let seen = 0;
	for (let i = 0; i < words.length; i++) {
		const matches = target.every((t, j) => words[i + j] && normalize(words[i + j].text) === t);
		if (matches) {
			seen++;
			if (seen === occurrence) {
				const w = edge === 'start' ? words[i].start : words[i + target.length - 1].end;
				return scene.voOffset + Math.round(w * fps);
			}
		}
	}
	return Math.round(fallbackSeconds * fps);
};

/** Frame ranges (absolute, in composition frames) where VO is playing — used for music ducking. */
export const voRanges = (
	scenes: TimedScene[],
	fps: number,
	transitionFrames = 0,
): Array<[number, number]> => {
	const ranges: Array<[number, number]> = [];
	let cursor = 0;
	for (const s of scenes) {
		if (s.vo) {
			const start = cursor + s.voOffset;
			ranges.push([start, start + Math.ceil(s.vo.duration * fps)]);
		}
		cursor += s.durationInFrames - transitionFrames;
	}
	return ranges;
};
