import React from 'react';
import {Audio} from '@remotion/media';
import {interpolate, useVideoConfig} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Background music with fade in/out and automatic ducking while the voice-over
 * plays. Get `duckRanges` from voRanges(scenes, fps, transitionFrames).
 */
export const MusicBed: React.FC<{
	readonly src: string;
	readonly volume?: number;
	/** Volume while VO is speaking, as a fraction of `volume`. */
	readonly duckTo?: number;
	readonly duckRanges?: Array<[number, number]>;
	readonly fadeInSeconds?: number;
	readonly fadeOutSeconds?: number;
	readonly loop?: boolean;
}> = ({src, volume = 0.5, duckTo = 0.35, duckRanges = [], fadeInSeconds = 1, fadeOutSeconds = 2, loop = true}) => {
	const {fps, durationInFrames} = useVideoConfig();
	const ramp = Math.round(0.25 * fps);
	return (
		<Audio
			name="Music"
			src={src}
			loop={loop}
			volume={(f) => {
				const fade = Math.min(
					interpolate(f, [0, fadeInSeconds * fps], [0, 1], clamp),
					interpolate(f, [durationInFrames - fadeOutSeconds * fps, durationInFrames], [1, 0], clamp),
				);
				const duck = duckRanges.reduce((d, [a, b]) => {
					const inRange = interpolate(f, [a - ramp, a, b, b + ramp], [0, 1, 1, 0], clamp);
					return Math.max(d, inRange);
				}, 0);
				return volume * fade * (1 - duck * (1 - duckTo));
			}}
		/>
	);
};
