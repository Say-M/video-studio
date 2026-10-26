import React from 'react';
import {useBrand} from '../theme';

/**
 * Frame-driven UI micro-interactions. Every component takes plain numbers
 * (0 → 1 progress values) so the scene animates them with inline interpolate()
 * and can cue them to cursor clicks or VO words.
 */

/** Toast / notification card sliding in. `progress` 0 = hidden, 1 = shown. */
export const Toast: React.FC<{
	readonly title: string;
	readonly description?: string;
	readonly progress: number;
	readonly tone?: 'success' | 'info' | 'danger';
	readonly width?: number;
	readonly style?: React.CSSProperties;
}> = ({title, description, progress, tone = 'success', width = 420, style}) => {
	const brand = useBrand();
	const color = tone === 'success' ? brand.colors.success : tone === 'danger' ? brand.colors.danger : brand.colors.primary;
	return (
		<div
			style={{
				width,
				display: 'flex',
				gap: 16,
				alignItems: 'flex-start',
				padding: '18px 20px',
				background: '#fff',
				borderRadius: brand.radius,
				boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15,23,42,0.06)',
				fontFamily: brand.fonts.body,
				opacity: progress,
				translate: `0 ${(1 - progress) * 30}px`,
				scale: String(0.94 + 0.06 * progress),
				...style,
			}}
		>
			<div
				style={{
					width: 32,
					height: 32,
					borderRadius: '50%',
					background: color,
					flexShrink: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
					{tone === 'danger' ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray={24} strokeDashoffset={24 * (1 - Math.min(1, progress * 1.4))} />}
				</svg>
			</div>
			<div>
				<div style={{fontWeight: 650, fontSize: 19, color: brand.colors.text}}>{title}</div>
				{description ? <div style={{fontSize: 16, color: brand.colors.mutedText, marginTop: 4}}>{description}</div> : null}
			</div>
		</div>
	);
};

/** Toggle switch. `on` 0 = off, 1 = on (animate between for the flip). */
export const Toggle: React.FC<{
	readonly on: number;
	readonly size?: number;
	readonly color?: string;
}> = ({on, size = 52, color}) => {
	const brand = useBrand();
	const c = color ?? brand.colors.primary;
	const h = size * 0.58;
	const knob = h - 6;
	return (
		<div
			style={{
				width: size,
				height: h,
				borderRadius: h,
				background: on > 0.5 ? c : '#CBD5E1',
				position: 'relative',
			}}
		>
			<div
				style={{
					position: 'absolute',
					top: 3,
					left: 3 + on * (size - knob - 6),
					width: knob,
					height: knob,
					borderRadius: '50%',
					background: '#fff',
					boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
				}}
			/>
		</div>
	);
};

/** Button with hover + press states. `hover` and `press` are 0 → 1. */
export const PressButton: React.FC<{
	readonly children: React.ReactNode;
	readonly hover?: number;
	readonly press?: number;
	readonly variant?: 'primary' | 'secondary';
	readonly style?: React.CSSProperties;
}> = ({children, hover = 0, press = 0, variant = 'primary', style}) => {
	const brand = useBrand();
	const primary = variant === 'primary';
	return (
		<div
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 8,
				padding: '12px 22px',
				borderRadius: brand.radius * 0.7,
				fontFamily: brand.fonts.body,
				fontWeight: 600,
				fontSize: 18,
				background: primary ? brand.colors.primary : '#fff',
				color: primary ? '#fff' : brand.colors.text,
				border: primary ? 'none' : `1px solid ${brand.colors.border}`,
				filter: `brightness(${1 + hover * 0.08 - press * 0.12})`,
				scale: String(1 + hover * 0.03 - press * 0.06),
				boxShadow: primary ? `0 ${6 + hover * 6}px ${18 + hover * 10}px ${brand.colors.primary}55` : undefined,
				...style,
			}}
		>
			{children}
		</div>
	);
};

/** Progress / upload bar. `progress` 0 → 1. */
export const ProgressBar: React.FC<{
	readonly progress: number;
	readonly width?: number;
	readonly height?: number;
	readonly color?: string;
}> = ({progress, width = 360, height = 10, color}) => {
	const brand = useBrand();
	return (
		<div style={{width, height, borderRadius: height, background: '#E2E8F0', overflow: 'hidden'}}>
			<div style={{width: `${Math.max(0, Math.min(1, progress)) * 100}%`, height: '100%', borderRadius: height, background: color ?? brand.colors.primary}} />
		</div>
	);
};

/** Loading skeleton with a moving shimmer. `frame` drives the shimmer. */
export const Skeleton: React.FC<{
	readonly width: number | string;
	readonly height: number;
	readonly frame: number;
	readonly radius?: number;
}> = ({width, height, frame, radius = 8}) => (
	<div
		style={{
			width,
			height,
			borderRadius: radius,
			background: `linear-gradient(90deg, #EEF2F7 0%, #F8FAFC ${((frame * 2) % 140) - 20}%, #EEF2F7 100%)`,
		}}
	/>
);
