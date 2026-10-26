import React from 'react';
import {AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background, KineticText, PressButton, SceneVoice, useBrand, useFormat, type TimedScene} from '../../../library';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

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
					text="Your next report writes *itself.*"
					startFrame={6}
					highlightColor={brand.colors.accent}
					style={{fontFamily: brand.fonts.heading, fontWeight: 800, fontSize: 100 * unit, color: '#fff', justifyContent: 'center', textAlign: 'center'}}
				/>
				<PressButton
					hover={interpolate(frame, [1.2 * fps, 1.6 * fps], [0, 1], clamp)}
					style={{
						fontSize: 40 * unit,
						padding: `${22 * unit}px ${48 * unit}px`,
						opacity: interpolate(frame, [0.8 * fps, 1.2 * fps], [0, 1], clamp),
					}}
				>
					Start free trial →
				</PressButton>
				<Interactive.Div
					name="URL"
					style={{
						fontFamily: brand.fonts.body,
						fontSize: 40 * unit,
						color: 'rgba(255,255,255,0.7)',
						opacity: interpolate(frame, [1.4 * fps, 1.9 * fps], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)}),
					}}
				>
					lumen.io
				</Interactive.Div>
			</AbsoluteFill>
			<SceneVoice scene={scene} />
		</AbsoluteFill>
	);
};
