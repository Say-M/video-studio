import React from 'react';
import {AbsoluteFill, Easing, interpolate, Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import {
	Background,
	BrowserFrame,
	Camera,
	Captions,
	Cursor,
	SceneVoice,
	SFX,
	Spotlight,
	Toast,
	useFormat,
	wordFrame,
	type TimedScene,
} from '../../../library';
import {center, Dashboard, DASHBOARD_SIZE, HOTSPOTS} from '../ui/Dashboard';

// The stage is a 1920×1080 canvas the camera moves over. The browser sits in
// the middle; UI coordinates are converted to stage coordinates with toStage().
const STAGE = {width: 1920, height: 1080};
const TOOLBAR = 52;
const FRAME = {
	x: (STAGE.width - DASHBOARD_SIZE.width) / 2,
	y: (STAGE.height - (DASHBOARD_SIZE.height + TOOLBAR)) / 2,
};
const toStage = (p: {x: number; y: number}) => ({x: FRAME.x + p.x, y: FRAME.y + TOOLBAR + p.y});
const rectToStage = (r: {x: number; y: number; width: number; height: number}) => ({...r, ...toStage(r)});

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const GenerateScene: React.FC<{readonly scene: TimedScene}> = ({scene}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const {isVertical, unit, safe} = useFormat();

	// Cue everything to the spoken word "click" (falls back to 2.5s before VO exists).
	const clickF = wordFrame(scene, 'click', fps, {fallbackSeconds: 2.5});
	const loadedF = clickF + Math.round(1.4 * fps);

	const button = toStage(center(HOTSPOTS.generateButton));
	const card = toStage(center(HOTSPOTS.reportCard));
	// Vertical/square viewports show less of the stage, so zoom further in.
	const z = isVertical ? 1.75 : 1;

	return (
		<AbsoluteFill>
			<Background variant="grid" base="#EEF0F8" />
			<Camera
				contentWidth={STAGE.width}
				contentHeight={STAGE.height}
				keys={[
					{at: 0, x: 960, y: 540, zoom: 1 * z},
					{at: clickF - 25, x: 960, y: 540, zoom: 1 * z},
					{at: clickF - 5, x: button.x - 150, y: button.y + 120, zoom: 1.9 * z},
					{at: clickF + 20, x: button.x - 150, y: button.y + 120, zoom: 1.9 * z},
					{at: loadedF, x: card.x, y: card.y - 60, zoom: 1.3 * z},
					{at: durationInFrames - 20, x: card.x, y: card.y - 60, zoom: 1.2 * z},
				]}
			>
				<div style={{position: 'absolute', left: FRAME.x, top: FRAME.y}}>
					<BrowserFrame width={DASHBOARD_SIZE.width} height={DASHBOARD_SIZE.height + TOOLBAR} url="app.lumen.io/reports" compact>
						<Dashboard
							frame={frame}
							buttonHover={interpolate(frame, [clickF - 12, clickF - 4], [0, 1], clamp)}
							buttonPress={interpolate(frame, [clickF, clickF + 3, clickF + 8], [0, 1, 0], clamp)}
							report={frame < clickF + 6 ? 0 : frame < loadedF ? 0.5 : 1}
						/>
					</BrowserFrame>
				</div>
				<Spotlight
					rect={rectToStage(HOTSPOTS.reportCard)}
					progress={interpolate(frame, [loadedF + 10, loadedF + 25], [0, 1], clamp)}
					dim={0.45}
				/>
				{/* Cursor lives inside the camera so it zooms with the UI. */}
				<Cursor
					path={[
						{at: 8, x: 1500, y: 950},
						{at: clickF - 14, x: button.x - 40, y: button.y + 18, variant: 'hand'},
						{at: clickF, x: button.x - 30, y: button.y + 10, click: true},
						{at: loadedF + 20, x: card.x + 380, y: card.y + 240, variant: 'arrow'},
					]}
				/>
			</Camera>

			{/* Success toast in screen space (not zoomed). */}
			<AbsoluteFill style={{alignItems: isVertical ? 'center' : 'flex-end', padding: `${safe.y}px ${safe.x}px`}}>
				<Toast
					title="Report ready"
					description="Q3 summary generated in 4.2s"
					progress={interpolate(frame, [loadedF, loadedF + 14], [0, 1], {...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1)})}
					width={460 * unit}
					style={{scale: String(unit)}}
				/>
			</AbsoluteFill>
			<Sequence from={loadedF} durationInFrames={30} layout="none" name="Toast sound">
				<Audio src={SFX.ding} volume={0.35} />
			</Sequence>

			{isVertical && scene.vo ? (
				<AbsoluteFill style={{justifyContent: 'flex-end', paddingBottom: 220 * unit, paddingLeft: safe.x, paddingRight: safe.x}}>
					<Captions words={scene.vo.words} offsetFrames={scene.voOffset} />
				</AbsoluteFill>
			) : null}
			<SceneVoice scene={scene} />
		</AbsoluteFill>
	);
};
