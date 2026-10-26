import React from 'react';
import {AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background, Callout, ISOMETRIC, LayerStack, Projection, SceneVoice, useBrand, useFormat, type TimedScene} from '../../../library';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const Layer: React.FC<{readonly label: string; readonly color: string; readonly children?: React.ReactNode}> = ({label, color, children}) => (
	<div
		style={{
			width: '100%',
			height: '100%',
			borderRadius: 28,
			background: color,
			border: '2px solid rgba(255,255,255,0.5)',
			display: 'flex',
			flexDirection: 'column',
			padding: 32,
			boxSizing: 'border-box',
			fontFamily: 'Inter, system-ui, sans-serif',
			color: '#fff',
			fontSize: 30,
			fontWeight: 700,
		}}
	>
		{label}
		{children}
	</div>
);

/** Isometric "exploded layers" shot explaining how the feature works. */
export const HowScene: React.FC<{readonly scene: TimedScene}> = ({scene}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const brand = useBrand();
	const {unit, isLandscape, safe} = useFormat();
	const intro = interpolate(frame, [0, 1.2 * fps], [0, 1], {...clamp, easing: Easing.bezier(0.65, 0, 0.35, 1)});
	const spread = interpolate(frame, [0.9 * fps, 2.2 * fps], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)});
	const size = 560 * unit;

	return (
		<AbsoluteFill>
			<Background variant="mesh" />
			<Interactive.Div
				name="Section title"
				style={{
					position: 'absolute',
					top: safe.y,
					left: safe.x,
					right: safe.x,
					textAlign: isLandscape ? 'left' : 'center',
					fontFamily: brand.fonts.heading,
					fontWeight: 800,
					fontSize: 84 * unit,
					color: '#fff',
					opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], clamp),
				}}
			>
				How it works
			</Interactive.Div>
			<Projection rotateX={ISOMETRIC.rotateX * intro} rotateZ={ISOMETRIC.rotateZ * intro} perspective={0} style={{top: 120 * unit}}>
				<LayerStack width={size} height={size} spread={spread} gap={130 * unit}>
					<Layer label="Your data" color="#334155" />
					<Layer label="Lumen AI" color={brand.colors.primary} />
					<Layer label="Report" color="#0EA5E9" />
				</LayerStack>
			</Projection>
			{isLandscape ? (
				<>
					<Callout x={1180} y={420} dx={170} dy={-60} label="Ready-to-share report" progress={interpolate(frame, [2.3 * fps, 3.1 * fps], [0, 1], clamp)} />
					<Callout x={1220} y={640} dx={150} dy={60} label="Connects to 40+ sources" progress={interpolate(frame, [3.0 * fps, 3.8 * fps], [0, 1], clamp)} />
				</>
			) : null}
			<SceneVoice scene={scene} />
		</AbsoluteFill>
	);
};
