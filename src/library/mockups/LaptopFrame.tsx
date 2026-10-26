import React from 'react';

/**
 * Laptop mockup. Screen content is laid out at `screenWidth × screenHeight`
 * (default 1440 × 900) and scaled to fit `width`.
 */
export const LaptopFrame: React.FC<{
	readonly width?: number;
	readonly screenWidth?: number;
	readonly screenHeight?: number;
	readonly children: React.ReactNode;
	readonly style?: React.CSSProperties;
}> = ({width = 1300, screenWidth = 1440, screenHeight = 900, children, style}) => {
	const lid = width * 0.84;
	const bezel = lid * 0.022;
	const scale = (lid - bezel * 2) / screenWidth;
	const lidHeight = screenHeight * scale + bezel * 2.4;
	return (
		<div style={{width, display: 'flex', flexDirection: 'column', alignItems: 'center', ...style}}>
			<div
				style={{
					width: lid,
					height: lidHeight,
					background: '#0D0D0F',
					borderRadius: `${bezel * 1.6}px ${bezel * 1.6}px 0 0`,
					padding: `${bezel * 1.4}px ${bezel}px ${bezel}px`,
					boxShadow: 'inset 0 0 0 2px #2C2C30',
				}}
			>
				<div style={{width: screenWidth * scale, height: screenHeight * scale, overflow: 'hidden', position: 'relative', background: '#fff'}}>
					<div
						style={{
							position: 'absolute',
							left: 0,
							top: 0,
							width: screenWidth,
							height: screenHeight,
							transformOrigin: '0 0',
							scale: String(scale),
						}}
					>
						{children}
					</div>
				</div>
			</div>
			<div
				style={{
					width,
					height: width * 0.03,
					background: 'linear-gradient(#D9DADE, #A9AAB0)',
					borderRadius: `0 0 ${width * 0.04}px ${width * 0.04}px`,
					position: 'relative',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: '50%',
						top: 0,
						width: width * 0.14,
						marginLeft: -width * 0.07,
						height: width * 0.012,
						background: '#BFC0C4',
						borderRadius: `0 0 ${width * 0.01}px ${width * 0.01}px`,
					}}
				/>
			</div>
		</div>
	);
};
