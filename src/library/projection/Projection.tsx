import React from 'react';

/**
 * CSS 3D projection for UI: tilt, isometric, or perspective views of any
 * content (mockups, recreated UI, screenshots). All angles are plain numbers so
 * the caller animates them with inline interpolate() in the scene.
 *
 * Isometric look ≈ rotateX 55, rotateZ -45. Hero tilt ≈ rotateX 18, rotateY -22.
 */
export const Projection: React.FC<{
	readonly rotateX?: number;
	readonly rotateY?: number;
	readonly rotateZ?: number;
	/** Distance of the viewer in px; smaller = stronger perspective. Use 0 for orthographic (true isometric). */
	readonly perspective?: number;
	readonly children: React.ReactNode;
	readonly style?: React.CSSProperties;
}> = ({rotateX = 0, rotateY = 0, rotateZ = 0, perspective = 2400, children, style}) => (
	<div
		style={{
			position: 'absolute',
			inset: 0,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			perspective: perspective > 0 ? perspective : undefined,
			...style,
		}}
	>
		<div
			style={{
				transformStyle: 'preserve-3d',
				transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
			}}
		>
			{children}
		</div>
	</div>
);

export const ISOMETRIC = {rotateX: 55, rotateY: 0, rotateZ: -45} as const;

/**
 * Exploded layer stack ("interface layers" shot): each child is a layer, lifted
 * by `gap * spread` px along Z. Animate `spread` 0 → 1 to explode the UI apart.
 * Render inside <Projection {...ISOMETRIC}>.
 */
export const LayerStack: React.FC<{
	readonly width: number;
	readonly height: number;
	readonly gap?: number;
	readonly spread: number;
	readonly layerShadow?: boolean;
	readonly children: React.ReactNode;
}> = ({width, height, gap = 120, spread, layerShadow = true, children}) => {
	const layers = React.Children.toArray(children);
	return (
		<div style={{position: 'relative', width, height, transformStyle: 'preserve-3d'}}>
			{layers.map((layer, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						inset: 0,
						transform: `translateZ(${i * gap * spread}px)`,
						boxShadow: layerShadow && i > 0 ? `0 ${20 * spread}px ${60 * spread}px rgba(0,0,0,${0.25 * spread})` : undefined,
					}}
				>
					{layer}
				</div>
			))}
		</div>
	);
};
