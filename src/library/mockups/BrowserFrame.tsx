import React from 'react';

type Props = {
	readonly width: number;
	readonly height: number;
	readonly url?: string;
	readonly theme?: 'light' | 'dark';
	readonly tabTitle?: string;
	/** Hide the tab strip for a slimmer Safari-like frame. */
	readonly compact?: boolean;
	readonly radius?: number;
	readonly shadow?: boolean;
	readonly children: React.ReactNode;
	readonly style?: React.CSSProperties;
};

/**
 * Browser window chrome. `width`/`height` is the outer size; the content area
 * is height minus the toolbar (52px compact, 88px with tabs).
 * Put screenshots, screen recordings or recreated UI inside.
 */
export const BrowserFrame: React.FC<Props> = ({
	width,
	height,
	url = 'app.example.com',
	theme = 'light',
	tabTitle,
	compact = false,
	radius = 14,
	shadow = true,
	children,
	style,
}) => {
	const dark = theme === 'dark';
	const chrome = dark ? '#1F2023' : '#F1F3F4';
	const bar = dark ? '#2B2C30' : '#FFFFFF';
	const text = dark ? '#C8CACF' : '#5F6368';
	const toolbar = compact ? 52 : 88;
	return (
		<div
			style={{
				width,
				height,
				borderRadius: radius,
				overflow: 'hidden',
				background: chrome,
				boxShadow: shadow ? '0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.08)' : undefined,
				display: 'flex',
				flexDirection: 'column',
				...style,
			}}
		>
			<div style={{height: toolbar, flexShrink: 0, display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif'}}>
				{compact ? null : (
					<div style={{height: 38, display: 'flex', alignItems: 'flex-end', paddingLeft: 90}}>
						<div
							style={{
								height: 30,
								minWidth: 200,
								padding: '0 16px',
								background: bar,
								borderRadius: '10px 10px 0 0',
								color: text,
								fontSize: 13,
								display: 'flex',
								alignItems: 'center',
							}}
						>
							{tabTitle ?? url}
						</div>
					</div>
				)}
				<div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 14, padding: '0 16px', background: compact ? chrome : bar}}>
					<TrafficLights />
					<div
						style={{
							flex: 1,
							maxWidth: Math.min(640, width * 0.6),
							margin: '0 auto',
							height: 32,
							borderRadius: 16,
							background: dark ? '#3A3B40' : '#F1F3F4',
							color: text,
							fontSize: 14,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: 8,
						}}
					>
						<svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={text} strokeWidth={2.5}>
							<rect x="5" y="11" width="14" height="10" rx="2" />
							<path d="M8 11V7a4 4 0 0 1 8 0v4" />
						</svg>
						{url}
					</div>
					<div style={{width: 52}} />
				</div>
			</div>
			<div style={{position: 'relative', flex: 1, overflow: 'hidden', background: dark ? '#111' : '#fff'}}>{children}</div>
		</div>
	);
};

export const TrafficLights: React.FC<{readonly size?: number}> = ({size = 12}) => (
	<div style={{display: 'flex', gap: size * 0.66}}>
		{['#FF5F57', '#FEBC2E', '#28C840'].map((c) => (
			<div key={c} style={{width: size, height: size, borderRadius: '50%', background: c}} />
		))}
	</div>
);
