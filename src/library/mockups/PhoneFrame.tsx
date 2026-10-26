import React from 'react';

/**
 * Modern phone mockup. Screen content is laid out at 390 × 844 (iPhone points)
 * and scaled to `width`, so recreated mobile UI can use real app dimensions.
 */
export const PHONE_SCREEN = {width: 390, height: 844} as const;

export const PhoneFrame: React.FC<{
	readonly width?: number;
	readonly color?: string;
	readonly statusBar?: 'light' | 'dark' | false;
	readonly time?: string;
	readonly children: React.ReactNode;
	readonly style?: React.CSSProperties;
}> = ({width = 420, color = '#1A1A1C', statusBar = 'dark', time = '9:41', children, style}) => {
	const bezel = 14;
	const scale = (width - bezel * 2) / PHONE_SCREEN.width;
	const height = PHONE_SCREEN.height * scale + bezel * 2;
	return (
		<div
			style={{
				width,
				height,
				borderRadius: 64 * scale + bezel,
				background: color,
				padding: bezel,
				boxShadow: '0 40px 90px rgba(0,0,0,0.4), inset 0 0 0 2px rgba(255,255,255,0.08)',
				position: 'relative',
				...style,
			}}
		>
			<div
				style={{
					width: PHONE_SCREEN.width * scale,
					height: PHONE_SCREEN.height * scale,
					borderRadius: 52 * scale,
					overflow: 'hidden',
					position: 'relative',
					background: '#fff',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						width: PHONE_SCREEN.width,
						height: PHONE_SCREEN.height,
						transformOrigin: '0 0',
						scale: String(scale),
					}}
				>
					{children}
					{statusBar ? (
						<div
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								right: 0,
								height: 54,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'space-between',
								padding: '0 34px',
								fontFamily: 'Inter, system-ui, sans-serif',
								fontWeight: 600,
								fontSize: 17,
								color: statusBar === 'dark' ? '#000' : '#fff',
							}}
						>
							<span>{time}</span>
							<span style={{letterSpacing: 2, fontSize: 13}}>●●● ▮</span>
						</div>
					) : null}
					{/* Dynamic island */}
					<div
						style={{
							position: 'absolute',
							top: 11,
							left: '50%',
							marginLeft: -62,
							width: 124,
							height: 36,
							borderRadius: 20,
							background: '#000',
						}}
					/>
				</div>
			</div>
		</div>
	);
};
