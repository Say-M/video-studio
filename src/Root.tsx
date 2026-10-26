import React from 'react';
// Each project registers its compositions in src/projects/<slug>/Compositions.tsx.
// scripts/new-project.mjs adds the import and JSX lines between the markers below.
// @projects-imports-start
import {DemoSaasLaunchCompositions} from './projects/demo-saas-launch/Compositions';
// @projects-imports-end

export const RemotionRoot: React.FC = () => {
	return (
		<>
			{/* @projects-jsx-start */}
			<DemoSaasLaunchCompositions />
			{/* @projects-jsx-end */}
		</>
	);
};
