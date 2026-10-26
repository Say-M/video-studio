import React, {createContext, useContext} from 'react';

/**
 * Brand kit used by every library component. Each client has a brand.json in
 * clients/<client>/brand.json; projects import it and wrap the video in
 * <BrandProvider brand={brand}>.
 */
export type Brand = {
	name: string;
	colors: {
		primary: string;
		secondary: string;
		accent: string;
		background: string;
		surface: string;
		text: string;
		mutedText: string;
		border: string;
		success: string;
		danger: string;
	};
	fonts: {
		heading: string;
		body: string;
		mono: string;
	};
	radius: number;
	/** Path relative to public/, e.g. "clients/acme/logo.svg" */
	logo?: string;
	/** Tone hints for scripts and motion: e.g. "playful", "enterprise", "minimal" */
	style?: string;
};

export const defaultBrand: Brand = {
	name: 'Default',
	colors: {
		primary: '#5B5BF6',
		secondary: '#0EA5E9',
		accent: '#F59E0B',
		background: '#0B0B12',
		surface: '#FFFFFF',
		text: '#0F172A',
		mutedText: '#64748B',
		border: '#E2E8F0',
		success: '#22C55E',
		danger: '#EF4444',
	},
	fonts: {
		heading: 'Inter, system-ui, sans-serif',
		body: 'Inter, system-ui, sans-serif',
		mono: 'JetBrains Mono, ui-monospace, monospace',
	},
	radius: 14,
};

const BrandContext = createContext<Brand>(defaultBrand);

export const BrandProvider: React.FC<{
	readonly brand: Partial<Brand> & {colors?: Partial<Brand['colors']>; fonts?: Partial<Brand['fonts']>};
	readonly children: React.ReactNode;
}> = ({brand, children}) => {
	const merged: Brand = {
		...defaultBrand,
		...brand,
		colors: {...defaultBrand.colors, ...brand.colors},
		fonts: {...defaultBrand.fonts, ...brand.fonts},
	};
	return <BrandContext.Provider value={merged}>{children}</BrandContext.Provider>;
};

export const useBrand = () => useContext(BrandContext);
