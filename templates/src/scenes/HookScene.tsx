import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Background, Captions, KineticText, SceneVoice, useBrand, useFormat, type TimedScene} from '../../../library';

export const HookScene: React.FC<{readonly scene: TimedScene}> = ({scene}) => {
	const brand = useBrand();
	const {unit, isVertical, safe} = useFormat();
	return (
		<AbsoluteFill>
			<Background variant="mesh" />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: `${safe.y}px ${safe.x}px`}}>
				<KineticText
					text="__TITLE__"
					startFrame={6}
					highlightColor={brand.colors.secondary}
					style={{fontFamily: brand.fonts.heading, fontWeight: 800, fontSize: 110 * unit, color: '#fff', justifyContent: 'center', textAlign: 'center'}}
				/>
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
