import useMediaQuery from "./useMediaQuery";

const useDeviceMediaQuery = () => {
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const isMobile = useMediaQuery("(max-width: 425px)");
	const isMax556 = useMediaQuery("(max-width: 556px)");
	const isMax766 = useMediaQuery("(max-width: 766px)");
	const isTablet = !isDesktop && !isMobile;

	return { isDesktop, isMobile, isTablet, isMax556, isMax766 };
};

export default useDeviceMediaQuery;
