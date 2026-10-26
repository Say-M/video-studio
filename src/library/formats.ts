import {useVideoConfig} from 'remotion';

/**
 * Delivery formats. 4K is not a separate composition: render the landscape
 * composition with --scale=2 (scripts/render.mjs does this for "4k").
 */
export const FORMATS = {
	landscape: {suffix: '16x9', width: 1920, height: 1080},
	vertical: {suffix: '9x16', width: 1080, height: 1920},
	square: {suffix: '1x1', width: 1080, height: 1080},
} as const;

export type FormatName = keyof typeof FORMATS;

/** Detects the current format from the composition size so scenes can adapt their layout. */
export const useFormat = () => {
	const {width, height} = useVideoConfig();
	const ratio = width / height;
	const format: FormatName = ratio > 1.2 ? 'landscape' : ratio < 0.8 ? 'vertical' : 'square';
	// Scale factor relative to a 1080px short edge, so sizes written for 1080p stay correct in every format.
	const unit = Math.min(width, height) / 1080;
	return {
		format,
		width,
		height,
		unit,
		isLandscape: format === 'landscape',
		isVertical: format === 'vertical',
		isSquare: format === 'square',
		/** Safe-area padding (px) recommended by the Remotion layout rules. */
		safe: {x: Math.round(80 * unit), y: Math.round(100 * unit)},
	};
};
