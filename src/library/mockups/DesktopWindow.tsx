import React from 'react';
import {TrafficLights} from './BrowserFrame';

/** macOS-style app window (for desktop apps, terminals, settings panels). */
export const DesktopWindow: React.FC<{
	readonly width: number;
	readonly height: number;
	readonly title?: string;
	readonly theme?: 'light' | 'dark';
	readonly radius?: number;
	readonly children: React.ReactNode;
	readonly style?: React.CSSProperties;
}> = ({width, height, title, theme = 'light', radius = 12, children, style}) => {
	const dark = theme === 'dark';
	return (
		<div
			style={{
				width,
				height,
				borderRadius: radius,
				overflow: 'hidden',
				background: dark ? '#1E1E1E' : '#FFFFFF',
				boxShadow: '0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.1)',
				display: 'flex',
				flexDirection: 'column',
				...style,
			}}
		>
			<div
				style={{
					height: 40,
					flexShrink: 0,
					display: 'flex',
					alignItems: 'center',
					padding: '0 14px',
					background: dark ? '#2A2A2A' : '#F6F6F6',
					borderBottom: `1px solid ${dark ? '#000' : '#E5E5E5'}`,
					position: 'relative',
				}}
			>
				<TrafficLights />
				{title ? (
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							textAlign: 'center',
							fontFamily: 'Inter, system-ui, sans-serif',
							fontSize: 13,
							fontWeight: 600,
							color: dark ? '#BBB' : '#555',
						}}
					>
						{title}
					</div>
				) : null}
			</div>
			<div style={{position: 'relative', flex: 1, overflow: 'hidden'}}>{children}</div>
		</div>
	);
};
