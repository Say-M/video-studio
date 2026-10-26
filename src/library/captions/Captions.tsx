import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import type {VoWord} from '../timing';
import {useBrand} from '../theme';

/**
 * Word-highlight captions driven by VO word timestamps (vo-timings.json).
 * Words are grouped into short pages; the spoken word is highlighted.
 * Render inside the scene so times are relative to the scene's VO start
 * (pass `offsetFrames` = scene.voOffset).
 */
export const Captions: React.FC<{
	readonly words: VoWord[];
	readonly offsetFrames?: number;
	readonly maxWords?: number;
	readonly fontSize?: number;
	readonly highlightColor?: string;
	readonly style?: React.CSSProperties;
}> = ({words, offsetFrames = 0, maxWords = 4, fontSize = 64, highlightColor, style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const brand = useBrand();
	const t = (frame - offsetFrames) / fps;

	// Split into pages at maxWords or at pauses longer than 0.45s.
	const pages: VoWord[][] = [];
	for (const w of words) {
		const page = pages[pages.length - 1];
		if (!page || page.length >= maxWords || w.start - page[page.length - 1].end > 0.45) {
			pages.push([w]);
		} else {
			page.push(w);
		}
	}
	const page = pages.find((p, i) => t >= p[0].start - 0.05 && t < (pages[i + 1]?.[0].start ?? p[p.length - 1].end + 0.6));
	if (!page) {
		return null;
	}
	return (
		<div
			style={{
				display: 'flex',
				flexWrap: 'wrap',
				justifyContent: 'center',
				columnGap: '0.3em',
				fontFamily: brand.fonts.heading,
				fontWeight: 800,
				fontSize,
				lineHeight: 1.15,
				color: '#fff',
				textShadow: '0 4px 18px rgba(0,0,0,0.55)',
				textAlign: 'center',
				...style,
			}}
		>
			{page.map((w, i) => {
				const active = t >= w.start && t < w.end + 0.05;
				return (
					<span
						key={i}
						style={{
							color: active ? highlightColor ?? brand.colors.accent : undefined,
							scale: active ? '1.06' : '1',
							display: 'inline-block',
						}}
					>
						{w.text}
					</span>
				);
			})}
		</div>
	);
};
