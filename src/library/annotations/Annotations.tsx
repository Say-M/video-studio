import React from 'react';
import {useBrand} from '../theme';

export type Rect = {x: number; y: number; width: number; height: number};

/**
 * Dims everything except `rect`. `progress` 0 → 1 fades the dim in; animate
 * `rect` between UI elements to walk the viewer through an interface.
 */
export const Spotlight: React.FC<{
	readonly rect: Rect;
	readonly progress: number;
	readonly dim?: number;
	readonly radius?: number;
	readonly padding?: number;
}> = ({rect, progress, dim = 0.62, radius = 14, padding = 10}) => (
	<div
		style={{
			position: 'absolute',
			left: rect.x - padding,
			top: rect.y - padding,
			width: rect.width + padding * 2,
			height: rect.height + padding * 2,
			borderRadius: radius,
			boxShadow: `0 0 0 9999px rgba(5, 6, 15, ${dim * progress})`,
			pointerEvents: 'none',
		}}
	/>
);

/** Rectangle outline that draws itself as `progress` goes 0 → 1. */
export const HighlightBox: React.FC<{
	readonly rect: Rect;
	readonly progress: number;
	readonly color?: string;
	readonly strokeWidth?: number;
	readonly radius?: number;
	readonly padding?: number;
	readonly glow?: boolean;
}> = ({rect, progress, color, strokeWidth = 4, radius = 12, padding = 8, glow = true}) => {
	const brand = useBrand();
	const c = color ?? brand.colors.primary;
	const w = rect.width + padding * 2;
	const h = rect.height + padding * 2;
	const perimeter = 2 * (w + h);
	return (
		<svg
			style={{position: 'absolute', left: rect.x - padding, top: rect.y - padding, overflow: 'visible', pointerEvents: 'none'}}
			width={w}
			height={h}
		>
			<rect
				x={0}
				y={0}
				width={w}
				height={h}
				rx={radius}
				fill="none"
				stroke={c}
				strokeWidth={strokeWidth}
				strokeDasharray={perimeter}
				strokeDashoffset={perimeter * (1 - progress)}
				style={{filter: glow ? `drop-shadow(0 0 10px ${c})` : undefined}}
			/>
		</svg>
	);
};

/**
 * Label pointing at a UI element: a dot on the target, a leader line, and a
 * pill. `progress` 0 → 1 animates dot → line → label.
 */
export const Callout: React.FC<{
	readonly x: number;
	readonly y: number;
	readonly label: React.ReactNode;
	readonly progress: number;
	/** Offset of the label from the target point. */
	readonly dx?: number;
	readonly dy?: number;
	readonly color?: string;
	readonly fontSize?: number;
}> = ({x, y, label, progress, dx = 160, dy = -90, color, fontSize = 28}) => {
	const brand = useBrand();
	const c = color ?? brand.colors.primary;
	const dot = Math.min(1, progress * 3);
	const line = Math.max(0, Math.min(1, (progress - 0.2) * 2.5));
	const pill = Math.max(0, Math.min(1, (progress - 0.55) * 2.2));
	const len = Math.hypot(dx, dy);
	return (
		<div style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}}>
			<svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>
				<line
					x1={x}
					y1={y}
					x2={x + dx}
					y2={y + dy}
					stroke={c}
					strokeWidth={3}
					strokeDasharray={len}
					strokeDashoffset={len * (1 - line)}
				/>
				<circle cx={x} cy={y} r={9 * dot} fill={c} />
				<circle cx={x} cy={y} r={18 * dot} fill={c} opacity={0.25} />
			</svg>
			<div
				style={{
					position: 'absolute',
					left: x + dx,
					top: y + dy,
					translate: `${dx >= 0 ? '0' : '-100%'} -50%`,
					opacity: pill,
					scale: String(0.85 + 0.15 * pill),
					background: c,
					color: '#fff',
					fontFamily: brand.fonts.body,
					fontWeight: 600,
					fontSize,
					padding: `${fontSize * 0.35}px ${fontSize * 0.7}px`,
					borderRadius: 999,
					whiteSpace: 'nowrap',
					boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
				}}
			>
				{label}
			</div>
		</div>
	);
};
