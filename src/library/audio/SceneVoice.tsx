import React from 'react';
import {Audio} from '@remotion/media';
import {staticFile} from 'remotion';
import type {TimedScene} from '../timing';

/**
 * Plays a scene's voice-over line at the scene's VO offset. Put it inside the
 * scene's sequence so the voice moves with the scene when timing changes.
 * Renders nothing until scripts/tts.mjs has produced the line.
 */
export const SceneVoice: React.FC<{readonly scene: TimedScene; readonly volume?: number}> = ({scene, volume = 1}) => {
	if (!scene.vo) {
		return null;
	}
	return (
		<Audio
			name={`VO ${scene.id}`}
			src={staticFile(scene.vo.file)}
			from={scene.voOffset}
			volume={volume}
			playbackRate={scene.vo.playbackRate ?? 1}
			preservePitch
		/>
	);
};
