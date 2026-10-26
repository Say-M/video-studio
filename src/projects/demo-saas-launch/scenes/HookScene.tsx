import React from 'react';
import {AbsoluteFill, Easing, Img, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Background, Captions, KineticText, SceneVoice, useBrand, useFormat, wordFrame, type TimedScene} from '../../../library';

export const HookScene: React.FC<{readonly scene: TimedScene}> = ({scene}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const brand = useBrand();
	const {unit, isVertical, safe} = useFormat();
	const titleAt = wordFrame(scene, 'meet', fps, {fallbackSeconds: 0.4});

	return (
		<AbsoluteFill>
			<Background variant="mesh" />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: `${safe.y}px ${safe.x}px`, gap: 40 * unit}}>
				<Img
					name="Logo"
					src={staticFile('clients/demo/logo.svg')}
					style={{
						width: 120 * unit,
						height: 120 * unit,
						scale: interpolate(frame, [0, 0.6 * fps], [0.5, 1], {
							easing: Easing.spring({damping: 14}),
							output: 'perceptual-scale',
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						opacity: interpolate(frame, [0, 0.3 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
					}}
				/>
				<KineticText
					text="Meet *Smart* *Reports*"
					startFrame={titleAt}
					highlightColor={brand.colors.secondary}
					style={{
						fontFamily: brand.fonts.heading,
						fontWeight: 800,
						fontSize: (isVertical ? 130 : 120) * unit,
						color: '#fff',
						justifyContent: 'center',
						textAlign: 'center',
						letterSpacing: -2,
					}}
				/>
				<Interactive.Div
					name="Subtitle"
					style={{
						fontFamily: brand.fonts.body,
						fontSize: 44 * unit,
						color: 'rgba(255,255,255,0.75)',
						textAlign: 'center',
						opacity: interpolate(frame, [0.9 * fps, 1.4 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
						translate: interpolate(frame, [0.9 * fps, 1.4 * fps], ['0px 20px', '0px 0px'], {
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
					}}
				>
					AI-written insights, one click away.
				</Interactive.Div>
			</AbsoluteFill>
			{isVertical && scene.vo ? (
				<AbsoluteFill style={{justifyContent: 'flex-end', paddingBottom: 260 * unit, paddingLeft: safe.x, paddingRight: safe.x}}>
					<Captions words={scene.vo.words} offsetFrames={scene.voOffset} />
				</AbsoluteFill>
			) : null}
			<SceneVoice scene={scene} />
		</AbsoluteFill>
	);
};
