import {loadFont as loadInter} from '@remotion/google-fonts/Inter';

/**
 * Default UI font, loaded for every project (the library components assume Inter).
 * Brand fonts: load them in the project's Video.tsx with @remotion/google-fonts/<Font>
 * or a local font file (see remotion-markup local-fonts.md), then set brand.json fonts.
 */
export const {fontFamily: INTER} = loadInter('normal', {
	weights: ['400', '500', '600', '700', '800'],
	subsets: ['latin'],
});
