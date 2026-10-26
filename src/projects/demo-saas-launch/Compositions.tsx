import React from 'react';
import {Composition, Folder, type CalculateMetadataFunction} from 'remotion';
import {buildTimeline, totalFrames} from '../../library';
import {FPS, PLAN, TIMINGS, TRANSITION} from './plan';
import {DemoSaasLaunch} from './Video';

// Duration follows the voice-over: regenerate VO and the video re-times itself.
const calculateMetadata: CalculateMetadataFunction<Record<string, unknown>> = () => ({
	durationInFrames: totalFrames(buildTimeline(PLAN, TIMINGS, FPS), TRANSITION),
});

/** Composition ids: <slug>-<format>. 4K = render the 16x9 one with --scale=2. */
export const DemoSaasLaunchCompositions: React.FC = () => (
	<Folder name="demo-saas-launch">
		<Composition
			id="demo-saas-launch-16x9"
			component={DemoSaasLaunch}
			width={1920}
			height={1080}
			fps={30}
			durationInFrames={600}
			calculateMetadata={calculateMetadata}
		/>
		<Composition
			id="demo-saas-launch-9x16"
			component={DemoSaasLaunch}
			width={1080}
			height={1920}
			fps={30}
			durationInFrames={600}
			calculateMetadata={calculateMetadata}
		/>
		<Composition
			id="demo-saas-launch-1x1"
			component={DemoSaasLaunch}
			width={1080}
			height={1080}
			fps={30}
			durationInFrames={600}
			calculateMetadata={calculateMetadata}
		/>
	</Folder>
);
