import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

export type CameraKey = {
	/** Frame (relative to the parent Sequence) at which the camera reaches this framing. */
	at: number;
	/** Focus point in content pixels (the point that ends up centered). */
	x: number;
	y: number;
	/** 1 = content fits the viewport. 2 = 2× zoom. */
	zoom: number;
};

type Props = {
	readonly keys: CameraKey[];
	/** Content size in px. Defaults to the composition size. */
	readonly contentWidth?: number;
	readonly contentHeight?: number;
	/** Prevent the camera from revealing empty space beyond the content edges. */
	readonly clampToEdges?: boolean;
	readonly easing?: (t: number) => number;
	readonly children: React.ReactNode;
	readonly style?: React.CSSProperties;
};

const DEFAULT_EASING = Easing.bezier(0.65, 0, 0.25, 1);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/**
 * Virtual camera for screen recordings and UI mockups: pans and zooms the
 * content to a sequence of focus points ("zoom into the Settings button").
 *
 * The content is laid out at contentWidth × contentHeight (e.g. the 1920×1080
 * screenshot or recording) and the camera frames it inside the composition.
 */
export const Camera: React.FC<Props> = ({
	keys,
	contentWidth,
	contentHeight,
	clampToEdges = true,
	easing = DEFAULT_EASING,
	children,
	style,
}) => {
	const frame = useCurrentFrame();
	const {width: vw, height: vh} = useVideoConfig();
	const cw = contentWidth ?? vw;
	const ch = contentHeight ?? vh;
	// zoom = 1 means "fit content into viewport".
	const fit = Math.min(vw / cw, vh / ch);

	const sorted = [...keys].sort((a, b) => a.at - b.at);
	const sample = (prop: 'x' | 'y' | 'zoom') => {
		if (sorted.length === 0) {
			return prop === 'zoom' ? 1 : prop === 'x' ? cw / 2 : ch / 2;
		}
		if (sorted.length === 1) {
			return sorted[0][prop];
		}
		// Zoom is interpolated in log space so zooming in and out feel equally fast.
		const values = sorted.map((k) => (prop === 'zoom' ? Math.log(k[prop]) : k[prop]));
		const v = interpolate(
			frame,
			sorted.map((k) => k.at),
			values,
			{...clamp, easing},
		);
		return prop === 'zoom' ? Math.exp(v) : v;
	};

	const zoom = sample('zoom');
	const scale = fit * zoom;
	let tx = vw / 2 - sample('x') * scale;
	let ty = vh / 2 - sample('y') * scale;
	if (clampToEdges) {
		const minX = Math.min(0, vw - cw * scale);
		const minY = Math.min(0, vh - ch * scale);
		const centerX = (vw - cw * scale) / 2;
		const centerY = (vh - ch * scale) / 2;
		tx = cw * scale <= vw ? centerX : Math.max(minX, Math.min(0, tx));
		ty = ch * scale <= vh ? centerY : Math.max(minY, Math.min(0, ty));
	}

	return (
		<div style={{position: 'absolute', inset: 0, overflow: 'hidden', ...style}}>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: cw,
					height: ch,
					transformOrigin: '0 0',
					translate: `${tx}px ${ty}px`,
					scale: String(scale),
				}}
			>
				{children}
			</div>
		</div>
	);
};
