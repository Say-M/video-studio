import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background, KineticText, PressButton, SceneVoice, useBrand, useFormat, type TimedScene} from '../../../library';

export const CtaScene: React.FC<{readonly scene: TimedScene}> = ({scene}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const brand = useBrand();
	const {unit, safe} = useFormat();
	return (
		<AbsoluteFill>
			<Background variant="mesh" />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 56 * unit, padding: `${safe.y}px ${safe.x}px`}}>
				<KineticText
					text="Call to action *here*"
					startFrame={6}
					highlightColor={brand.colors.accent}
					style={{fontFamily: brand.fonts.heading, fontWeight: 800, fontSize: 100 * unit, color: '#fff', justifyContent: 'center', textAlign: 'center'}}
				/>
				<PressButton
					style={{
						fontSize: 40 * unit,
						padding: `${22 * unit}px ${48 * unit}px`,
						opacity: interpolate(frame, [0.8 * fps, 1.2 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
					}}
				>
					Get started →
				</PressButton>
			</AbsoluteFill>
			<SceneVoice scene={scene} />
		</AbsoluteFill>
	);
};
