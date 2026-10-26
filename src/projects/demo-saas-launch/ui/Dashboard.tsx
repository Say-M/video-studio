import React from 'react';
import {Skeleton, PressButton} from '../../../library';

/**
 * Recreated app UI (the "Lumen" dashboard), laid out at 1440 × 900 — the size
 * of the reference screenshot. Animatable state comes in as props; HOTSPOTS
 * exports the pixel rects of interactive elements so the cursor, camera and
 * spotlight can target them exactly.
 */
export const DASHBOARD_SIZE = {width: 1440, height: 900} as const;

export const HOTSPOTS = {
	generateButton: {x: 1180, y: 40, width: 210, height: 52},
	reportCard: {x: 300, y: 288, width: 1090, height: 572},
	sidebarReports: {x: 24, y: 192, width: 212, height: 44},
} as const;

export const center = (r: {x: number; y: number; width: number; height: number}) => ({
	x: r.x + r.width / 2,
	y: r.y + r.height / 2,
});

type Props = {
	/** 0 → 1 hover on the Generate button */
	readonly buttonHover?: number;
	/** 0 → 1 press on the Generate button */
	readonly buttonPress?: number;
	/** 0 = no report, between 0 and 1 = loading skeleton, 1 = report shown */
	readonly report?: number;
	/** Frame, for the skeleton shimmer */
	readonly frame: number;
};

const C = {
	bg: '#F7F8FC',
	sidebar: '#FFFFFF',
	text: '#0F172A',
	muted: '#64748B',
	border: '#E7EAF3',
	primary: '#5B5BF6',
};

export const Dashboard: React.FC<Props> = ({buttonHover = 0, buttonPress = 0, report = 0, frame}) => {
	const bars = [42, 58, 51, 74, 66, 88, 79, 95, 84, 102, 96, 118];
	return (
		<div
			style={{
				width: DASHBOARD_SIZE.width,
				height: DASHBOARD_SIZE.height,
				background: C.bg,
				fontFamily: 'Inter, system-ui, sans-serif',
				color: C.text,
				position: 'relative',
				display: 'flex',
			}}
		>
			{/* Sidebar */}
			<div style={{width: 260, boxSizing: 'border-box', background: C.sidebar, borderRight: `1px solid ${C.border}`, padding: 24, display: 'flex', flexDirection: 'column', gap: 6}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36}}>
					<div style={{width: 32, height: 32, borderRadius: 9, background: C.primary}} />
					<div style={{fontWeight: 700, fontSize: 20}}>Lumen</div>
				</div>
				{['Overview', 'Dashboards', 'Reports', 'Customers', 'Settings'].map((item) => (
					<div
						key={item}
						style={{
							height: 44,
							borderRadius: 10,
							padding: '0 14px',
							display: 'flex',
							alignItems: 'center',
							fontSize: 16,
							fontWeight: item === 'Reports' ? 600 : 500,
							color: item === 'Reports' ? C.primary : C.muted,
							background: item === 'Reports' ? '#EEF0FF' : 'transparent',
						}}
					>
						{item}
					</div>
				))}
			</div>

			{/* Main */}
			<div style={{flex: 1, boxSizing: 'border-box', padding: '40px 50px 40px 40px', display: 'flex', flexDirection: 'column', gap: 28}}>
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 52}}>
					<div>
						<div style={{fontSize: 30, fontWeight: 700}}>Reports</div>
						<div style={{fontSize: 16, color: C.muted, marginTop: 4}}>Q3 performance · All workspaces</div>
					</div>
					<PressButton hover={buttonHover} press={buttonPress} style={{width: 210, height: 52, padding: 0}}>
						✦ Generate report
					</PressButton>
				</div>

				<div style={{display: 'flex', gap: 20}}>
					{[
						['Revenue', '$482.6k', '+18.2%'],
						['Active users', '24,190', '+9.4%'],
						['Churn', '1.8%', '−0.6%'],
					].map(([label, value, delta]) => (
						<div key={label} style={{flex: 1, height: 140, boxSizing: 'border-box', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16, padding: 24}}>
							<div style={{fontSize: 15, color: C.muted}}>{label}</div>
							<div style={{fontSize: 34, fontWeight: 700, marginTop: 8}}>{value}</div>
							<div style={{fontSize: 14, color: '#16A34A', marginTop: 6, fontWeight: 600}}>{delta} vs last quarter</div>
						</div>
					))}
				</div>

				{/* AI report card */}
				<div style={{flex: 1, boxSizing: 'border-box', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, display: 'flex', gap: 32}}>
					{report <= 0 ? (
						<div style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontSize: 18}}>
							No report yet — click “Generate report”
						</div>
					) : report < 1 ? (
						<div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 16}}>
							<Skeleton width="40%" height={26} frame={frame} />
							<Skeleton width="90%" height={16} frame={frame} />
							<Skeleton width="80%" height={16} frame={frame} />
							<Skeleton width="100%" height={150} frame={frame} radius={12} />
						</div>
					) : (
						<>
							<div style={{width: 380}}>
								<div style={{fontSize: 14, fontWeight: 700, color: C.primary, letterSpacing: 1}}>AI SUMMARY</div>
								<div style={{fontSize: 24, fontWeight: 700, marginTop: 10, lineHeight: 1.3}}>Revenue grew 18% driven by enterprise upgrades.</div>
								<div style={{fontSize: 16, color: C.muted, marginTop: 12, lineHeight: 1.5}}>
									Expansion revenue doubled in EMEA. Churn fell for the third quarter in a row.
								</div>
							</div>
							<div style={{flex: 1, display: 'flex', alignItems: 'flex-end', gap: 12, paddingTop: 20}}>
								{bars.map((h, i) => (
									<div key={i} style={{flex: 1, height: h * 2, borderRadius: 6, background: i === bars.length - 1 ? C.primary : '#C7CAFF'}} />
								))}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
};
