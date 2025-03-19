/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import {
	Dispatch,
	FC,
	MutableRefObject,
	SetStateAction,
	Suspense,
	lazy,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState
} from "react";

import { Flex, Loader, Text } from "@aws-amplify/ui-react";
import { IconClose, IconNotificationBell } from "@demo/assets/svgs";
import { ConfirmationModal } from "@demo/atomicui/molecules";
import appConfig from "@demo/core/constants/appConfig";
import BottomSheetHeights from "@demo/core/constants/bottomSheetHeights";
import { useGeofence, useMap, usePersistedData, useRoute } from "@demo/hooks";
import useBottomSheet from "@demo/hooks/useBottomSheet";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import { ShowStateType } from "@demo/types";
import { MapColorSchemeEnum, ResponsiveUIEnum, SettingOptionEnum } from "@demo/types/Enums";
import type { GeolocateControl as GeolocateControlRef } from "maplibre-gl";
import { useTranslation } from "react-i18next";
import { MapRef } from "react-map-gl/maplibre";
import { useLocation } from "react-router-dom";
import { BottomSheet } from "react-spring-bottom-sheet";
import { RefHandles } from "react-spring-bottom-sheet/dist/types";
import "react-spring-bottom-sheet/dist/style.css";
import "./styles.scss";

const Explore = lazy(() => import("../Explore").then(module => ({ default: module.Explore })));
const UnauthSimulation = lazy(() =>
	import("../UnauthSimulation").then(module => ({ default: module.UnauthSimulation }))
);

const {
	ROUTES: { DEMO }
} = appConfig;

interface IProps {
	mapRef: MutableRefObject<MapRef | null>;
	geolocateControlRef: MutableRefObject<GeolocateControlRef | null>;
	SearchBoxEl: (ref?: MutableRefObject<RefHandles | null>) => JSX.Element;
	MapButtons: (ref?: MutableRefObject<RefHandles | null>) => JSX.Element;
	RouteBox: (ref?: MutableRefObject<RefHandles | null>) => JSX.Element;
	onCloseSidebar: () => void;
	onOpenFeedbackModal: () => void;
	onShowSettings: () => void;
	onShowAboutModal: () => void;
	onShowUnauthSimulation: () => void;
	setShowUnauthSimulation: (b: boolean) => void;
	setShowStartUnauthSimulation: (b: boolean) => void;
	showStartUnauthSimulation: boolean;
	handleLogoClick: () => Window | null;
	show: ShowStateType;
	setShow: Dispatch<SetStateAction<ShowStateType>>;
	startSimulation: boolean;
	setStartSimulation: Dispatch<SetStateAction<boolean>>;
	isNotifications: boolean;
	setIsNotifications: Dispatch<SetStateAction<boolean>>;
	confirmCloseSimulation: boolean;
	setConfirmCloseSimulation: Dispatch<SetStateAction<boolean>>;
	setShowRouteBox: (b: boolean) => void;
	isExpandRouteOptionsMobile: boolean;
	setExpandRouteOptionsMobile: (b: boolean) => void;
	setSearchBoxValue: Dispatch<SetStateAction<string>>;
	setShowUnauthSimulationBounds: (b: boolean) => void;
}

const ResponsiveBottomSheet: FC<IProps> = ({
	mapRef,
	geolocateControlRef,
	SearchBoxEl,
	MapButtons,
	RouteBox,
	onCloseSidebar,
	onOpenFeedbackModal,
	onShowSettings,
	onShowAboutModal,
	onShowUnauthSimulation,
	setShowUnauthSimulation,
	setShowStartUnauthSimulation,
	handleLogoClick,
	show,
	setShow,
	startSimulation,
	setStartSimulation,
	isNotifications,
	setIsNotifications,
	confirmCloseSimulation,
	setConfirmCloseSimulation,
	setShowRouteBox,
	isExpandRouteOptionsMobile,
	setExpandRouteOptionsMobile,
	setSearchBoxValue,
	setShowUnauthSimulationBounds
}) => {
	const { isDesktop, isMobile, isTablet, isMax556, isDesktopBrowser } = useDeviceMediaQuery();
	const { unauthNotifications } = useGeofence();
	const { t } = useTranslation();
	const location = useLocation();
	const isDemoUrl = location.pathname === DEMO;
	const {
		setBottomSheetHeight,
		bottomSheetMinHeight,
		bottomSheetHeight,
		bottomSheetCurrentHeight = 0,
		setBottomSheetCurrentHeight,
		ui,
		setUI,
		setBottomSheetMinHeight
	} = useBottomSheet();
	const { setSettingsOptions } = usePersistedData();
	const { resetStore: resetRouteStore } = useRoute();
	const { mapColorScheme } = useMap();
	const [arrowDirection, setArrowDirection] = useState("no-dragging");
	const prevBottomSheetHeightRef = useRef(bottomSheetCurrentHeight);
	const bottomSheetRef = useRef<RefHandles | null>(null);

	const resetToExplore = useCallback(() => {
		setUI(ResponsiveUIEnum.explore);
		setBottomSheetMinHeight(window.innerHeight * 0.4 - 10);
		setBottomSheetHeight(window.innerHeight * 0.4);

		setTimeout(() => {
			setBottomSheetMinHeight(BottomSheetHeights.search.min);
			setBottomSheetHeight(window.innerHeight);
		}, 500);
	}, [setBottomSheetHeight, setBottomSheetMinHeight, setUI]);

	useEffect(() => {
		if (bottomSheetCurrentHeight > prevBottomSheetHeightRef.current) {
			setArrowDirection("dragging-up");
		} else if (bottomSheetCurrentHeight < prevBottomSheetHeightRef.current) {
			setArrowDirection("dragging-down");
		}

		prevBottomSheetHeightRef.current = bottomSheetCurrentHeight;
	}, [bottomSheetCurrentHeight, setBottomSheetHeight, setBottomSheetMinHeight, ui]);

	useEffect(() => {
		setTimeout(() => {
			const targetElement = document.querySelector('[data-rsbs-scroll="true"]') as HTMLElement;
			targetElement?.classList.add("hideScroll");

			let scrollTimeout: NodeJS.Timer | undefined;

			const handleWheel = () => {
				clearTimeout(scrollTimeout);
				targetElement?.classList.remove("hideScroll");

				scrollTimeout = setTimeout(() => {
					targetElement?.classList.add("hideScroll");
				}, 500);
			};

			targetElement?.addEventListener("wheel", handleWheel);

			return () => {
				targetElement?.removeEventListener("wheel", handleWheel);
			};
		}, 1000);
	}, []);

	const isNonStartedSimulation = !isDesktop && ui && [ResponsiveUIEnum.before_start_unauth_simulation].includes(ui);

	const isExitSimulation = !isDesktop && ui && [ResponsiveUIEnum.exit_unauth_simulation].includes(ui);

	useEffect(() => {
		const resizeObserver = new ResizeObserver(entries => {
			for (const entry of entries) {
				setBottomSheetHeight(entry.contentRect.height);

				if (bottomSheetHeight > window.innerHeight) {
					setBottomSheetHeight(window.innerHeight);
				}
			}
		});

		const handleWindowResize = () => {
			resizeObserver.observe(document.body);
			isMobile ? setSettingsOptions(undefined) : setSettingsOptions(SettingOptionEnum.UNITS);
		};

		window.addEventListener("resize", handleWindowResize);

		return () => {
			window.removeEventListener("resize", handleWindowResize);
			resizeObserver.disconnect();
		};
	}, [setBottomSheetCurrentHeight, setBottomSheetHeight, bottomSheetHeight, isMobile, setSettingsOptions]);

	useEffect(() => {
		const resizeObserver = new ResizeObserver(entries => {
			for (const entry of entries) {
				setBottomSheetCurrentHeight(entry.contentRect.height);
				setBottomSheetHeight(window.innerHeight);
			}
		});

		const mutationObserver = new MutationObserver((mutationsList, observer) => {
			for (const mutation of mutationsList) {
				if (mutation.type === "childList") {
					const element = document.querySelector('div[data-rsbs-overlay="true"]') as HTMLDivElement;
					if (element) {
						resizeObserver.observe(element);
						observer.disconnect();
					}
				}
			}
		});

		mutationObserver.observe(document.body, { childList: true, subtree: true });

		return () => {
			mutationObserver.disconnect();
			resizeObserver.disconnect();
		};
	}, [setBottomSheetCurrentHeight, setBottomSheetHeight]);

	const UnauthSimulationUI = useMemo(
		() => (
			<UnauthSimulation
				mapRef={mapRef}
				setShowUnauthSimulation={b => setShow(s => ({ ...s, unauthSimulation: b }))}
				showStartUnauthSimulation={show.startUnauthSimulation}
				setShowStartUnauthSimulation={b => setShow(s => ({ ...s, startUnauthSimulation: b }))}
				startSimulation={startSimulation}
				setStartSimulation={setStartSimulation}
				setShowUnauthSimulationBounds={b => setShow(s => ({ ...s, unauthSimulationBounds: b }))}
				isNotifications={isNotifications}
				setIsNotifications={setIsNotifications}
				confirmCloseSimulation={confirmCloseSimulation}
				setConfirmCloseSimulation={setConfirmCloseSimulation}
				geolocateControlRef={geolocateControlRef}
			/>
		),
		[
			confirmCloseSimulation,
			isNotifications,
			mapRef,
			setConfirmCloseSimulation,
			setIsNotifications,
			setShow,
			setStartSimulation,
			show.startUnauthSimulation,
			startSimulation,
			geolocateControlRef
		]
	);

	const onCloseRouteBox = useCallback(() => {
		resetRouteStore();
		setShowRouteBox(false);
		setUI(ResponsiveUIEnum.explore);
		setSearchBoxValue("");
	}, [setUI, resetRouteStore, setShowRouteBox, setSearchBoxValue]);

	const handleClose = useCallback(() => {
		setShow(s => ({ ...s, unauthSimulation: false }));
		resetToExplore();
	}, [resetToExplore, setShow]);

	const onBackUnauthHandler = useCallback(() => {
		if (isNotifications) {
			setIsNotifications(false);
		} else {
			setConfirmCloseSimulation(true);
			setUI(ResponsiveUIEnum.exit_unauth_simulation);
		}
	}, [isNotifications, setConfirmCloseSimulation, setIsNotifications, setUI]);

	const handleUIAction = useCallback(() => {
		if ([ResponsiveUIEnum.non_start_unauth_simulation].includes(ui)) {
			handleClose();
		} else if ([ResponsiveUIEnum.unauth_simulation].includes(ui)) {
			onBackUnauthHandler();
		} else if ([ResponsiveUIEnum.routes, ResponsiveUIEnum.direction_to_routes].includes(ui)) {
			if (!isExpandRouteOptionsMobile) {
				onCloseRouteBox();
				setBottomSheetMinHeight(BottomSheetHeights.explore.min);
				setBottomSheetHeight(window.innerHeight);
			} else {
				setExpandRouteOptionsMobile(false);
				setTimeout(() => setBottomSheetMinHeight(BottomSheetHeights.routes.min), 200);
			}
		} else {
			setUI(ResponsiveUIEnum.explore);
		}
		document.querySelector("[data-rsbs-scroll='true']")!.scrollTop = 0;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ui, handleClose, onBackUnauthHandler, onCloseRouteBox, setExpandRouteOptionsMobile, setUI]);

	const bottomSheetHeader = useCallback(
		(ui?: ResponsiveUIEnum) => {
			switch (ui) {
				case ResponsiveUIEnum.map_styles:
					return (
						<Flex className="map-header-mobile">
							<Flex justifyContent="flex-end">
								<IconClose
									width={20}
									height={20}
									fill="var(--grey-color)"
									onClick={() => {
										setUI(ResponsiveUIEnum.explore);
										document.querySelector("[data-rsbs-scroll='true']")!.scrollTop = 0;
									}}
								/>
							</Flex>
							<Flex direction="column" alignItems="flex-start" gap="0">
								<Text fontFamily="AmazonEmber-Bold" fontSize="1.23rem" textAlign="left">
									{t("map_style.text")}
								</Text>
							</Flex>
						</Flex>
					);
				case ResponsiveUIEnum.search:
				case ResponsiveUIEnum.explore:
				case ResponsiveUIEnum.before_start_unauth_simulation:
					return <Flex width="100%">{SearchBoxEl(bottomSheetRef)}</Flex>;
				case ResponsiveUIEnum.non_start_unauth_simulation:
				case ResponsiveUIEnum.unauth_simulation:
				case ResponsiveUIEnum.routes:
				case ResponsiveUIEnum.exit_unauth_simulation:
				case ResponsiveUIEnum.direction_to_routes:
					return (
						<Flex
							className="map-header-mobile"
							justifyContent={[ResponsiveUIEnum.unauth_simulation].includes(ui) ? "space-between" : "flex-end"}
							direction="row"
						>
							{[ResponsiveUIEnum.unauth_simulation].includes(ui) && (
								<Flex
									data-testid="bottomsheet-header-notification-icon"
									className={isNotifications ? "bell-icon-container bell-active" : "bell-icon-container"}
									onClick={() => setIsNotifications(n => !n)}
									position="relative"
								>
									<IconNotificationBell className="bell-icon" width={20} height={20} />
									{!isNotifications && !!unauthNotifications.length && <span className="notification-bubble" />}
								</Flex>
							)}
							<IconClose
								data-testid="bottomsheet-header-close-icon"
								width={20}
								height={20}
								fill="var(--grey-color)"
								onClick={handleUIAction}
							/>
						</Flex>
					);
				case ResponsiveUIEnum.poi_card:
					return null;
				default:
					return <Flex width="100%">{SearchBoxEl()}</Flex>;
			}
		},
		[SearchBoxEl, handleUIAction, isNotifications, setIsNotifications, setUI, t, unauthNotifications.length]
	);

	const bottomSheetBody = useCallback(
		(ui?: ResponsiveUIEnum) => {
			switch (ui) {
				case ResponsiveUIEnum.map_styles:
					return MapButtons(bottomSheetRef);
				case ResponsiveUIEnum.routes:
				case ResponsiveUIEnum.direction_to_routes:
					return RouteBox(bottomSheetRef);
				case ResponsiveUIEnum.unauth_simulation:
				case ResponsiveUIEnum.exit_unauth_simulation:
				case ResponsiveUIEnum.non_start_unauth_simulation:
					return UnauthSimulationUI;
				case ResponsiveUIEnum.poi_card:
					return <Flex width="100%">{SearchBoxEl()}</Flex>;
				case ResponsiveUIEnum.explore:
				case ResponsiveUIEnum.search:
				case ResponsiveUIEnum.before_start_unauth_simulation:
				default:
					return (
						<>
							{ui && [ResponsiveUIEnum.explore, ResponsiveUIEnum.before_start_unauth_simulation].includes(ui) && (
								<Explore
									updateUIInfo={setUI}
									onCloseSidebar={onCloseSidebar}
									onOpenFeedbackModal={onOpenFeedbackModal}
									onShowSettings={onShowSettings}
									onShowAboutModal={onShowAboutModal}
									onShowUnauthSimulation={onShowUnauthSimulation}
									bottomSheetRef={bottomSheetRef}
								/>
							)}
						</>
					);
			}
		},
		[
			MapButtons,
			RouteBox,
			SearchBoxEl,
			UnauthSimulationUI,
			onCloseSidebar,
			onOpenFeedbackModal,
			onShowAboutModal,
			onShowSettings,
			onShowUnauthSimulation,
			setUI
		]
	);

	const calculatePixelValue = useCallback(
		(maxHeight: number, number: number) => {
			const percentage = number / 100;

			let pixelValue = maxHeight * percentage;

			if (pixelValue < bottomSheetMinHeight) {
				pixelValue = bottomSheetMinHeight;
			}

			return pixelValue;
		},
		[bottomSheetMinHeight]
	);

	const footerHeight = useCallback((maxHeight: number) => calculatePixelValue(maxHeight, 50), [calculatePixelValue]);

	const onCloseHandler = useCallback(() => {
		setShowUnauthSimulationBounds(false);
		setShowStartUnauthSimulation(false);
		setShowUnauthSimulation(false);
		setConfirmCloseSimulation(false);
		resetToExplore();
		geolocateControlRef.current?.trigger();
	}, [
		setShowUnauthSimulationBounds,
		setShowStartUnauthSimulation,
		setShowUnauthSimulation,
		setConfirmCloseSimulation,
		resetToExplore,
		geolocateControlRef
	]);

	const ExitSimulation = () => (
		<Flex className="confirmation-modal-container">
			<ConfirmationModal
				open={confirmCloseSimulation}
				onClose={() => {
					setUI(ResponsiveUIEnum.unauth_simulation);
					setConfirmCloseSimulation(false);
				}}
				onCancel={onCloseHandler}
				heading={t("start_unauth_simulation__exit_simulation.text") as string}
				description={
					<Text
						className="small-text"
						variation="tertiary"
						marginTop="1.23rem"
						textAlign="center"
						whiteSpace="pre-line"
					>
						{t("start_unauth_simulation__exit_simulation_desc.text")}
					</Text>
				}
				onConfirm={() => {
					setUI(ResponsiveUIEnum.unauth_simulation);
					setConfirmCloseSimulation(false);
				}}
				confirmationText={t("start_unauth_simulation__stay_in_simulation.text") as string}
				cancelationText={t("exit.text") as string}
			/>
		</Flex>
	);

	return (
		<>
			{!isDesktop && isNonStartedSimulation && UnauthSimulationUI}
			{!isDesktop && isExitSimulation && <ExitSimulation />}

			<BottomSheet
				data-testid="bottomsheet"
				open
				ref={bottomSheetRef}
				blocking={false}
				snapPoints={({ maxHeight }) => [
					bottomSheetMinHeight,
					[ResponsiveUIEnum.map_styles, ResponsiveUIEnum.unauth_simulation, ResponsiveUIEnum.explore].includes(ui) ||
					(isDesktopBrowser &&
						[ResponsiveUIEnum.search, ResponsiveUIEnum.routes, ResponsiveUIEnum.direction_to_routes].includes(ui))
						? bottomSheetHeight * 0.4 - 10
						: footerHeight(maxHeight),
					[ResponsiveUIEnum.unauth_simulation].includes(ui) ? bottomSheetHeight - 60 : bottomSheetHeight - 10,
					bottomSheetMinHeight
				]}
				maxHeight={bottomSheetHeight}
				header={
					<Flex data-testid="bottomsheet-header" data-amplify-theme="aws-location-theme" direction="column" gap="0">
						{isMax556 && (
							<Flex className="logo-mobile-container">
								<Flex
									className={`logo-mobile ${mapColorScheme === MapColorSchemeEnum.DARK ? "dark-logo" : "light-logo"}`}
									onClick={handleLogoClick}
								/>
							</Flex>
						)}
						{bottomSheetHeader(ui)}
					</Flex>
				}
				className={`bottom-sheet ${isDesktop ? "desktop" : isTablet ? "tablet" : "mobile"} ${
					(bottomSheetCurrentHeight || 0) + 30 < window.innerHeight ? "add-overlay" : ""
				} ${!isDesktop && isDemoUrl ? "disable-body-scroll" : ""} ${
					ui && [ResponsiveUIEnum.poi_card, ResponsiveUIEnum.before_start_unauth_simulation].includes(ui)
						? "margin-top-from-header"
						: ""
				} ${arrowDirection} ${
					[ResponsiveUIEnum.direction_to_routes, ResponsiveUIEnum.routes].includes(ui) ? "no-scroll-on-content" : ""
				}`}
				scrollLocking={false}
				onSpringEnd={() => setArrowDirection("no-dragging")}
			>
				<Flex data-amplify-theme="aws-location-theme" direction="column" gap="0">
					<Suspense
						fallback={
							<Loader
								width="40px"
								height="40px"
								position="absolute"
								top="50%"
								left="50%"
								transform="translate(-50%, -50%)"
							/>
						}
					>
						{bottomSheetBody(ui)}
					</Suspense>
				</Flex>
			</BottomSheet>
		</>
	);
};

export default ResponsiveBottomSheet;
