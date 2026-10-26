/**
 * UI sound effects. Remote files hosted by Remotion; swap for local files in
 * public/library/sfx/ (or Stable Audio SFX from scripts/music.mjs --sfx) when
 * rendering offline or when a client needs a custom sound palette.
 */
export const SFX = {
	click: 'https://remotion.media/mouse-click.wav',
	whoosh: 'https://remotion.media/whoosh.wav',
	whip: 'https://remotion.media/whip.wav',
	switch: 'https://remotion.media/switch.wav',
	ding: 'https://remotion.media/ding.wav',
	pageTurn: 'https://remotion.media/page-turn.wav',
	shutter: 'https://remotion.media/shutter-modern.wav',
	notification: 'https://remotion.media/snapchat-notification.wav',
} as const;
