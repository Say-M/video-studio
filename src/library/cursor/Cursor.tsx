import React from 'react';
import {Easing, interpolate, Sequence, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import {SFX} from '../sfx';

export type CursorVariant = 'arrow' | 'hand' | 'text';

export type CursorKey = {
	/** Frame (relative to the parent Sequence) at which the cursor arrives here. */
	at: number;
	x: number;
	y: number;
	/** Click when arriving at this point. */
	click?: boolean;
	/** Cursor shape from this point on (e.g. 'hand' when hovering a button). */
	variant?: CursorVariant;
	/** Frames to rest here before moving to the next key. Defaults to 10 after a click, else 0. */
	hold?: number;
};

type Props = {
	readonly path: CursorKey[];
	readonly variant?: CursorVariant;
	/** Rendered size of the arrow in px (at 1080p). */
	readonly size?: number;
	/** Curvature of moves, 0 = straight lines. Natural hand movement ≈ 0.12–0.2. */
	readonly arc?: number;
	readonly rippleColor?: string;
	/** Play a click sound on every click key. */
	readonly clickSound?: boolean;
	/** Frames to fade the cursor in from the first key / out after the last key. 0 = always visible. */
	readonly fade?: number;
	readonly style?: React.CSSProperties;
};

const MOVE_EASING = Easing.bezier(0.6, 0.02, 0.2, 1);
const PRESS_FRAMES = 6;
const RIPPLE_FRAMES = 20;

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const positionAt = (path: CursorKey[], frame: number, arc: number) => {
	if (frame <= path[0].at) {
		return {x: path[0].x, y: path[0].y};
	}
	for (let i = 0; i < path.length - 1; i++) {
		const a = path[i];
		const b = path[i + 1];
		if (frame <= b.at) {
			const departAt = Math.min(a.at + (a.hold ?? (a.click ? 10 : 0)), b.at - 1);
			const t = interpolate(frame, [departAt, b.at], [0, 1], {...clamp, easing: MOVE_EASING});
			// Quadratic bezier with a control point pushed perpendicular to the move: hands move in arcs.
			const mx = (a.x + b.x) / 2;
			const my = (a.y + b.y) / 2;
			const dx = b.x - a.x;
			const dy = b.y - a.y;
			const cx = mx - dy * arc;
			const cy = my + dx * arc;
			const u = 1 - t;
			return {
				x: u * u * a.x + 2 * u * t * cx + t * t * b.x,
				y: u * u * a.y + 2 * u * t * cy + t * t * b.y,
			};
		}
	}
	const last = path[path.length - 1];
	return {x: last.x, y: last.y};
};

const variantAt = (path: CursorKey[], frame: number, fallback: CursorVariant) => {
	let v = fallback;
	for (const k of path) {
		if (k.at <= frame && k.variant) {
			v = k.variant;
		}
	}
	return v;
};

/**
 * Animated cursor with natural arcing moves, press feedback, click ripples and
 * optional click sounds. Place it as the top layer over a UI mockup or screen
 * recording; coordinates are in the same pixel space as that layer.
 *
 * Tip: drive `at` values from the voice-over with wordFrame() so the click
 * lands on the spoken word.
 */
export const Cursor: React.FC<Props> = ({
	path,
	variant = 'arrow',
	size = 34,
	arc = 0.14,
	rippleColor = 'rgba(91, 91, 246, 0.45)',
	clickSound = true,
	fade = 8,
	style,
}) => {
	const frame = useCurrentFrame();
	if (path.length === 0) {
		return null;
	}
	const {x, y} = positionAt(path, frame, arc);
	const current = variantAt(path, frame, variant);
	const clicks = path.filter((k) => k.click);

	const pressScale = clicks.reduce((s, k) => {
		const p = interpolate(frame, [k.at - 1, k.at + PRESS_FRAMES / 2, k.at + PRESS_FRAMES], [1, 0.82, 1], clamp);
		return Math.min(s, p);
	}, 1);

	const first = path[0].at;
	const last = path[path.length - 1].at;
	const opacity =
		fade > 0
			? Math.min(
					interpolate(frame, [first - fade, first], [0, 1], clamp),
					interpolate(frame, [last + 30, last + 30 + fade], [1, 0], clamp),
				)
			: 1;

	return (
		<div style={{position: 'absolute', inset: 0, pointerEvents: 'none', ...style}}>
			{clicks.map((k, i) => (
				<ClickRipple key={i} x={k.x} y={k.y} at={k.at} color={rippleColor} />
			))}
			<div
				style={{
					position: 'absolute',
					left: x,
					top: y,
					opacity,
					scale: String(pressScale),
					transformOrigin: '0 0',
					filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))',
				}}
			>
				<CursorShape variant={current} size={size} />
			</div>
			{clickSound
				? clicks.map((k, i) => (
						<Sequence key={`s${i}`} from={k.at} durationInFrames={20} layout="none" name="Click sound">
							<Audio src={SFX.click} volume={0.6} />
						</Sequence>
					))
				: null}
		</div>
	);
};

/** Expanding ring shown when a click happens. Exported for custom tap/touch effects. */
export const ClickRipple: React.FC<{
	readonly x: number;
	readonly y: number;
	readonly at: number;
	readonly color?: string;
	readonly size?: number;
}> = ({x, y, at, color = 'rgba(91, 91, 246, 0.45)', size = 90}) => {
	const frame = useCurrentFrame();
	if (frame < at || frame > at + RIPPLE_FRAMES) {
		return null;
	}
	const t = interpolate(frame, [at, at + RIPPLE_FRAMES], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
	return (
		<div
			style={{
				position: 'absolute',
				left: x - size / 2,
				top: y - size / 2,
				width: size,
				height: size,
				borderRadius: '50%',
				border: `3px solid ${color}`,
				background: color.replace(/[\d.]+\)$/, '0.15)'),
				scale: String(0.2 + t * 0.9),
				opacity: 1 - t,
			}}
		/>
	);
};

const CursorShape: React.FC<{readonly variant: CursorVariant; readonly size: number}> = ({variant, size}) => {
	if (variant === 'hand') {
		// Hotspot is the fingertip, shifted so (x, y) stays the click point.
		return (
			<svg width={size} height={size * 1.15} viewBox="0 0 24 28" style={{marginLeft: -size * 0.38, marginTop: -size * 0.05}}>
				<path
					d="M9 2.5C9 1.67 9.67 1 10.5 1S12 1.67 12 2.5V11h.5V9.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V11h.5v-.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V12h.2c.83 0 1.3.67 1.3 1.5V18c0 3.6-2.9 6.5-6.5 6.5h-1.6c-2 0-3.8-1-5-2.6L3.3 16c-.5-.7-.4-1.7.3-2.2.7-.5 1.6-.4 2.1.2L9 17V2.5z"
					fill="white"
					stroke="black"
					strokeWidth={1.3}
					strokeLinejoin="round"
				/>
			</svg>
		);
	}
	if (variant === 'text') {
		return (
			<svg width={size * 0.5} height={size} viewBox="0 0 12 24" style={{marginLeft: -size * 0.25, marginTop: -size * 0.5}}>
				<path d="M3 2h6M6 2v20M3 22h6" stroke="white" strokeWidth={4} strokeLinecap="round" />
				<path d="M3 2h6M6 2v20M3 22h6" stroke="black" strokeWidth={1.8} strokeLinecap="round" />
			</svg>
		);
	}
	return (
		<svg width={size} height={size} viewBox="0 0 24 24">
			<path
				d="M3 2 L3 20.5 L7.8 16 L11 23 L14.2 21.6 L11.1 14.8 L17.6 14.8 Z"
				fill="black"
				stroke="white"
				strokeWidth={1.6}
				strokeLinejoin="round"
			/>
		</svg>
	);
};
