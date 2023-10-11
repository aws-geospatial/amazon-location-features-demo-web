import { useMemo } from "react";

import useMediaQuery from "./useMediaQuery";

const useDeviceMediaQuery = () => {
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const isMobile = useMediaQuery("(max-width: 430px)");
	const isMax556 = useMediaQuery("(max-width: 556px)");
	const isMax766 = useMediaQuery("(max-width: 766px)");
	const isTablet = !isDesktop && !isMobile;

	const isDesktopBrowser = useMemo(() => {
		const userAgent = navigator.userAgent.toLowerCase();
		const mobileKeywords = ["android", "iphone", "ipad", "ipod", "windows phone"];

		for (const keyword of mobileKeywords) {
			if (userAgent.includes(keyword)) {
				return false; // Found a mobile keyword in the user agent string
			}
		}

		return true; // No mobile keywords found, so it's likely a desktop browser
	}, []);

	return { isDesktop, isMobile, isTablet, isMax556, isMax766, isDesktopBrowser };
};

export default useDeviceMediaQuery;
