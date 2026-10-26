import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {noise2D} from '@remotion/noise';
import {useBrand} from '../theme';

/**
 * Animated scene backgrounds.
 * - mesh: soft moving color blobs (hero / title scenes)
 * - grid: subtle dotted grid on a flat color (product / UI scenes)
 * - solid: brand background color
 */
export const Background: React.FC<{
	readonly variant?: 'mesh' | 'grid' | 'solid';
	readonly colors?: string[];
	readonly base?: string;
	readonly speed?: number;
}> = ({variant = 'mesh', colors, base, speed = 1}) => {
	const frame = useCurrentFrame();
	const brand = useBrand();
	const bg = base ?? brand.colors.background;
	const palette = colors ?? [brand.colors.primary, brand.colors.secondary, brand.colors.accent];

	if (variant === 'solid') {
		return <AbsoluteFill style={{background: bg}} />;
	}

	if (variant === 'grid') {
		return (
			<AbsoluteFill
				style={{
					background: bg,
					backgroundImage: `radial-gradient(${palette[0]}33 1.5px, transparent 1.5px)`,
					backgroundSize: '36px 36px',
					backgroundPosition: `${(frame * 0.3 * speed) % 36}px ${(frame * 0.2 * speed) % 36}px`,
				}}
			/>
		);
	}

	return (
		<AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
			{palette.map((c, i) => {
				const t = (frame / 240) * speed;
				const x = 50 + noise2D(`x${i}`, t, i) * 35;
				const y = 50 + noise2D(`y${i}`, i, t) * 35;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: `${x}%`,
							top: `${y}%`,
							width: '70%',
							aspectRatio: '1',
							translate: '-50% -50%',
							borderRadius: '50%',
							background: `radial-gradient(circle, ${c}AA 0%, ${c}00 65%)`,
							filter: 'blur(40px)',
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};
