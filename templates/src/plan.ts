import {withVoSpeed, type ScenePlanItem, type VoTimings} from '../../library';
import timingsJson from './vo-timings.json';

/**
 * Scene plan — mirrors projects/__SLUG__/script.md.
 * Scene ids must match voiceover.json so tts.mjs timings line up.
 * fallbackSeconds is used until the voice-over exists.
 */
export const FPS = 30;
export const TRANSITION = 12;

export const PLAN: ScenePlanItem[] = [
	{id: 's01-hook', fallbackSeconds: 4},
	{id: 's02-demo', fallbackSeconds: 8},
	{id: 's03-cta', fallbackSeconds: 4},
];

/**
 * Voice-over playback speed. 1 = as generated, 1.2 = 20% faster (pitch kept).
 * Scene lengths and every wordFrame() cue follow it, so change it freely
 * without regenerating the voice-over.
 */
export const VO_SPEED = 1;

export const TIMINGS = withVoSpeed(timingsJson as VoTimings, VO_SPEED);

/** Path relative to public/, or null until music is generated (scripts/music.mjs). */
export const MUSIC: string | null = null;
