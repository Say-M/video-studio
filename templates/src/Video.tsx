import React from 'react';
import {staticFile, useVideoConfig} from 'remotion';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {BrandProvider, buildTimeline, getScene, MusicBed, voRanges} from '../../library';
import brand from '../../../clients/__CLIENT__/brand.json';
import {MUSIC, PLAN, TIMINGS, TRANSITION} from './plan';
import {HookScene} from './scenes/HookScene';
import {DemoScene} from './scenes/DemoScene';
import {CtaScene} from './scenes/CtaScene';

export const __PASCAL__: React.FC = () => {
	const {fps} = useVideoConfig();
	const scenes = buildTimeline(PLAN, TIMINGS, fps);
	const hook = getScene(scenes, 's01-hook');
	const demo = getScene(scenes, 's02-demo');
	const cta = getScene(scenes, 's03-cta');

	return (
		<BrandProvider brand={brand}>
			<TransitionSeries>
				<TransitionSeries.Sequence name="Hook" durationInFrames={hook.durationInFrames}>
					<HookScene scene={hook} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRANSITION})} />
				<TransitionSeries.Sequence name="Demo" durationInFrames={demo.durationInFrames}>
					<DemoScene scene={demo} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRANSITION})} />
				<TransitionSeries.Sequence name="CTA" durationInFrames={cta.durationInFrames}>
					<CtaScene scene={cta} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			{MUSIC ? <MusicBed src={staticFile(MUSIC)} duckRanges={voRanges(scenes, fps, TRANSITION)} /> : null}
		</BrandProvider>
	);
};
