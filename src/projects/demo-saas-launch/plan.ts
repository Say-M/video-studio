import type {ScenePlanItem, VoTimings} from '../../library';
import timingsJson from './vo-timings.json';

/**
 * Scene plan — mirrors projects/demo-saas-launch/script.md.
 * Scene ids must match the ids in voiceover.json so tts.mjs timings line up.
 */
export const FPS = 30;
export const TRANSITION = 12;

export const PLAN: ScenePlanItem[] = [
	{id: 's01-hook', fallbackSeconds: 4},
	{id: 's02-generate', fallbackSeconds: 9},
	{id: 's03-how', fallbackSeconds: 6.5},
	{id: 's04-cta', fallbackSeconds: 4.5},
];

export const TIMINGS = timingsJson as VoTimings;

/** Path relative to public/, or null until music is generated (scripts/music.mjs). */
export const MUSIC: string | null = null;
