import { useMemo } from "react";

import { isUserDeviceIsAndroid, isUserDeviceIsIOS } from "@demo/utils";

import useMediaQuery from "./useMediaQuery";

const useDeviceMediaQuery = () => {
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const isMobile = useMediaQuery("(max-width: 430px)");
	const isMax556 = useMediaQuery("(max-width: 556px)");
	const isMax766 = useMediaQuery("(max-width: 766px)");
	const isTablet = !isDesktop && !isMobile;

	const isDesktopBrowser = useMemo(() => !isUserDeviceIsIOS() && !isUserDeviceIsAndroid(), []);

	return { isDesktop, isMobile, isTablet, isMax556, isMax766, isDesktopBrowser };
};

export default useDeviceMediaQuery;
