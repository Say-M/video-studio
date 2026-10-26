import React from 'react';
import {staticFile, useVideoConfig} from 'remotion';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';
import {BrandProvider, buildTimeline, getScene, MusicBed, voRanges} from '../../library';
import brand from '../../../clients/demo/brand.json';
import {MUSIC, PLAN, TIMINGS, TRANSITION} from './plan';
import {HookScene} from './scenes/HookScene';
import {GenerateScene} from './scenes/GenerateScene';
import {HowScene} from './scenes/HowScene';
import {CtaScene} from './scenes/CtaScene';

export const DemoSaasLaunch: React.FC = () => {
	const {fps} = useVideoConfig();
	const scenes = buildTimeline(PLAN, TIMINGS, fps);
	const hook = getScene(scenes, 's01-hook');
	const generate = getScene(scenes, 's02-generate');
	const how = getScene(scenes, 's03-how');
	const cta = getScene(scenes, 's04-cta');

	return (
		<BrandProvider brand={brand}>
			<TransitionSeries>
				<TransitionSeries.Sequence name="Hook" durationInFrames={hook.durationInFrames}>
					<HookScene scene={hook} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: TRANSITION})} />
				<TransitionSeries.Sequence name="Generate report" durationInFrames={generate.durationInFrames}>
					<GenerateScene scene={generate} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition presentation={slide({direction: 'from-right'})} timing={linearTiming({durationInFrames: TRANSITION})} />
				<TransitionSeries.Sequence name="How it works" durationInFrames={how.durationInFrames}>
					<HowScene scene={how} />
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
