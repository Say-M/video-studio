import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Word-by-word headline reveal. Each word rises, unblurs and fades in,
 * `stagger` frames after the previous one, starting at `startFrame`.
 * Wrap a word in *asterisks* to render it in `highlightColor`.
 */
export const KineticText: React.FC<{
	readonly text: string;
	readonly startFrame?: number;
	readonly stagger?: number;
	readonly mode?: 'rise' | 'blur' | 'pop';
	readonly highlightColor?: string;
	readonly style?: React.CSSProperties;
}> = ({text, startFrame = 0, stagger = 3, mode = 'rise', highlightColor, style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const words = text.split(/\s+/).filter(Boolean);
	return (
		<div style={{display: 'flex', flexWrap: 'wrap', columnGap: '0.28em', ...style}}>
			{words.map((raw, i) => {
				const highlighted = /^\*.+\*$/.test(raw);
				const word = highlighted ? raw.slice(1, -1) : raw;
				const start = startFrame + i * stagger;
				const t = interpolate(frame, [start, start + 0.55 * fps], [0, 1], {
					...clamp,
					easing: Easing.bezier(0.16, 1, 0.3, 1),
				});
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							opacity: t,
							color: highlighted ? highlightColor : undefined,
							translate: mode === 'rise' ? `0 ${(1 - t) * 0.5}em` : undefined,
							scale: mode === 'pop' ? String(0.6 + 0.4 * t) : undefined,
							filter: mode !== 'pop' ? `blur(${(1 - t) * 10}px)` : undefined,
						}}
					>
						{word}
					</span>
				);
			})}
		</div>
	);
};

/**
 * Typing animation for input fields, search bars, prompts and code.
 * Characters appear at `cps` from `startFrame`, with a blinking caret.
 */
export const TypeWriter: React.FC<{
	readonly text: string;
	readonly startFrame?: number;
	/** Characters per second. Human typing ≈ 12–18. */
	readonly cps?: number;
	readonly caret?: boolean;
	readonly caretColor?: string;
	readonly style?: React.CSSProperties;
}> = ({text, startFrame = 0, cps = 16, caret = true, caretColor = 'currentColor', style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const chars = Math.max(0, Math.floor(((frame - startFrame) / fps) * cps));
	const visible = text.slice(0, chars);
	const typing = chars > 0 && chars < text.length;
	const caretOn = typing || Math.floor(frame / (fps * 0.5)) % 2 === 0;
	return (
		<span style={{whiteSpace: 'pre-wrap', ...style}}>
			{visible}
			{caret ? (
				<span
					style={{
						display: 'inline-block',
						width: '0.08em',
						height: '1.1em',
						marginLeft: '0.04em',
						verticalAlign: 'text-bottom',
						background: caretColor,
						opacity: caretOn ? 1 : 0,
					}}
				/>
			) : null}
		</span>
	);
};

/** Frame at which a TypeWriter finishes — use it to time the next action. */
export const typingEndFrame = (text: string, startFrame: number, fps: number, cps = 16) =>
	startFrame + Math.ceil((text.length / cps) * fps);

/** Animated number (metrics, pricing, stats). `progress` 0 → 1. */
export const Counter: React.FC<{
	readonly from?: number;
	readonly to: number;
	readonly progress: number;
	readonly decimals?: number;
	readonly prefix?: string;
	readonly suffix?: string;
	readonly style?: React.CSSProperties;
}> = ({from = 0, to, progress, decimals = 0, prefix = '', suffix = '', style}) => {
	const value = from + (to - from) * Easing.out(Easing.cubic)(Math.max(0, Math.min(1, progress)));
	return (
		<span style={{fontVariantNumeric: 'tabular-nums', ...style}}>
			{prefix}
			{value.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})}
			{suffix}
		</span>
	);
};
