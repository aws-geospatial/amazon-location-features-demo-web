import useMediaQuery from "./useMediaQuery";

const useDeviceMediaQuery = () => {
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const isMobile = useMediaQuery("(max-width: 425px)");
	const isTablet = !isDesktop && !isMobile;

	return { isDesktop, isMobile, isTablet };
};

export default useDeviceMediaQuery;
