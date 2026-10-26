import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';
import {Background, BrowserFrame, Camera, Cursor, SceneVoice, useFormat, wordFrame, type TimedScene} from '../../../library';

// Placeholder product scene: replace the inner content with a recreated UI
// component (video-ui-recreate skill), a screenshot (<Img>) or a screen
// recording (<Video>) — and retarget the cursor/camera keys to its hotspots.
const STAGE = {width: 1920, height: 1080};
const UI = {width: 1440, height: 900};
const TOOLBAR = 52;
const FRAME = {x: (STAGE.width - UI.width) / 2, y: (STAGE.height - UI.height - TOOLBAR) / 2};

export const DemoScene: React.FC<{readonly scene: TimedScene}> = ({scene}) => {
	const {fps} = useVideoConfig();
	const {isVertical} = useFormat();
	const z = isVertical ? 1.75 : 1;
	const clickF = wordFrame(scene, 'click', fps, {fallbackSeconds: 2.5});
	const target = {x: FRAME.x + 1200, y: FRAME.y + TOOLBAR + 70};
	return (
		<AbsoluteFill>
			<Background variant="grid" base="#EEF0F8" />
			<Camera
				contentWidth={STAGE.width}
				contentHeight={STAGE.height}
				keys={[
					{at: 0, x: 960, y: 540, zoom: 1 * z},
					{at: clickF - 20, x: 960, y: 540, zoom: 1 * z},
					{at: clickF, x: target.x - 120, y: target.y + 120, zoom: 1.8 * z},
				]}
			>
				<div style={{position: 'absolute', left: FRAME.x, top: FRAME.y}}>
					<BrowserFrame width={UI.width} height={UI.height + TOOLBAR} url="app.example.com" compact>
						<div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, color: '#94A3B8', fontFamily: 'Inter, sans-serif'}}>
							Recreated UI goes here
						</div>
					</BrowserFrame>
				</div>
				<Cursor
					path={[
						{at: 8, x: 1500, y: 900},
						{at: clickF, x: target.x, y: target.y, click: true, variant: 'hand'},
					]}
				/>
			</Camera>
			<SceneVoice scene={scene} />
		</AbsoluteFill>
	);
};
