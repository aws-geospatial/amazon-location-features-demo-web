/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { useState } from "react";

const useScreenAnimation = () => {
	const [infoAppeared, setInfoAppeared] = useState(false);

	const applyAnimationCss = () => {
		let animatedCss = "opacity__appearence";
		if (infoAppeared) {
			animatedCss = "info__section__appearence";
		}
		return animatedCss;
	};

	return { setInfoAppeared, applyAnimationCss, infoAppeared };
};

export default useScreenAnimation;
