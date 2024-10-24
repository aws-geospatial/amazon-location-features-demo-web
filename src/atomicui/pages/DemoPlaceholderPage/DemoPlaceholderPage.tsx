import { FC, lazy } from "react";

import { Divider, Flex, View } from "@aws-amplify/ui-react";
import { IconLocateMe, IconMinus, IconZoomPlus, LogoLight } from "@demo/assets/svgs";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import { MenuItemEnum, ShowStateType } from "@demo/types";
import { MapRef } from "react-map-gl/maplibre";
import "./styles.scss";

const MapButtons = lazy(() =>
	import("@demo/atomicui/molecules/MapButtons").then(module => ({ default: module.MapButtons }))
);
const Sidebar = lazy(() => import("@demo/atomicui/organisms/Sidebar").then(module => ({ default: module.Sidebar })));
const SettingsModal = lazy(() =>
	import("@demo/atomicui/organisms/SettingsModal").then(module => ({ default: module.SettingsModal }))
);
const SearchBox = lazy(() =>
	import("@demo/atomicui/organisms/SearchBox").then(module => ({ default: module.SearchBox }))
);
const RouteBox = lazy(() => import("@demo/atomicui/organisms/RouteBox").then(module => ({ default: module.RouteBox })));
const UnauthSimulation = lazy(() =>
	import("@demo/atomicui/organisms/UnauthSimulation").then(module => ({ default: module.UnauthSimulation }))
);
const AuthGeofenceBox = lazy(() =>
	import("@demo/atomicui/organisms/AuthGeofenceBox").then(module => ({ default: module.AuthGeofenceBox }))
);
const AuthTrackerBox = lazy(() =>
	import("@demo/atomicui/organisms/AuthTrackerBox").then(module => ({ default: module.AuthTrackerBox }))
);

interface DemoPlaceholderPageProps {
	show: ShowStateType;
	value: string;
	setValue: (value: string) => void;
}

const DemoPlaceholderPage: FC<DemoPlaceholderPageProps> = ({ show, value, setValue }) => {
	const { isDesktop } = useDeviceMediaQuery();
	return (
		<View style={{ height: "100%" }}>
			<View className={"loader-container"}>
				{isDesktop && (
					<>
						{show.sidebar && (
							<Sidebar
								onCloseSidebar={() => {}}
								onOpenConnectAwsAccountModal={() => {}}
								onOpenSignInModal={() => {}}
								onShowSettings={() => {}}
								onShowAboutModal={() => {}}
								onShowAuthGeofenceBox={() => {}}
								onShowAuthTrackerBox={() => {}}
								onShowUnauthGeofenceBox={() => {}}
								onShowUnauthTrackerBox={() => {}}
								onOpenFeedbackModal={() => {}}
							/>
						)}
						{show.routeBox ? (
							<RouteBox
								mapRef={{
									current: {} as MapRef
								}}
								setShowRouteBox={() => {}}
								isSideMenuExpanded={show.sidebar}
							/>
						) : show.authGeofenceBox ? (
							<AuthGeofenceBox
								mapRef={{
									current: {} as MapRef
								}}
								setShowAuthGeofenceBox={() => {}}
								isEditingAuthRoute={false}
								setIsEditingAuthRoute={() => {}}
							/>
						) : show.authTrackerBox ? (
							<AuthTrackerBox
								mapRef={{
									current: {} as MapRef
								}}
								setShowAuthTrackerBox={() => {}}
							/>
						) : show.unauthGeofenceBox || show.unauthTrackerBox ? (
							<UnauthSimulation
								mapRef={{
									current: {} as MapRef
								}}
								geolocateControlRef={{ current: null }}
								from={show.unauthGeofenceBox ? MenuItemEnum.GEOFENCE : MenuItemEnum.TRACKER}
								setShowUnauthGeofenceBox={() => {}}
								setShowUnauthTrackerBox={() => {}}
								setShowConnectAwsAccountModal={() => {}}
								setShowUnauthSimulationBounds={() => {}}
								showStartUnauthSimulation={false}
								setShowStartUnauthSimulation={() => {}}
								startSimulation={false}
								setStartSimulation={() => {}}
								isNotifications={false}
								setIsNotifications={() => {}}
								confirmCloseSimulation={false}
								setConfirmCloseSimulation={() => {}}
							/>
						) : (
							<SearchBox
								mapRef={{
									current: {} as MapRef
								}}
								value={value}
								setValue={setValue}
								isSideMenuExpanded={show.sidebar}
								onToggleSideMenu={() => {}}
								setShowRouteBox={() => {}}
								isRouteBoxOpen={show.routeBox}
								isAuthGeofenceBoxOpen={show.authGeofenceBox}
								isAuthTrackerBoxOpen={show.authTrackerBox}
								isSettingsOpen={show.settings}
								isStylesCardOpen={show.stylesCard}
							/>
						)}
					</>
				)}

				<MapButtons
					renderedUpon={"Demo Page"}
					openStylesCard={show.stylesCard}
					setOpenStylesCard={() => {}}
					onCloseSidebar={() => {}}
					onOpenSignInModal={() => {}}
					onShowGridLoader={() => {}}
					isLoading={true}
					isAuthGeofenceBoxOpen={show.authGeofenceBox}
					onSetShowAuthGeofenceBox={() => {}}
					isAuthTrackerBoxOpen={show.authTrackerBox}
					onSetShowAuthTrackerBox={() => {}}
					isUnauthGeofenceBoxOpen={show.unauthGeofenceBox}
					isUnauthTrackerBoxOpen={show.unauthTrackerBox}
					onSetShowUnauthGeofenceBox={() => {}}
					onSetShowUnauthTrackerBox={() => {}}
				/>

				<Flex className={`location-disabled ${!isDesktop ? "location-disabled-mobile" : ""}`}>
					<IconLocateMe />
				</Flex>
				{isDesktop && (
					<Flex className={"navigation-control"}>
						<IconZoomPlus />
						<Divider backgroundColor={"#DDDDDD"} size="small" opacity="0.3" />
						<IconMinus />
					</Flex>
				)}
			</View>
			<SettingsModal
				open={show.settings}
				onClose={() => {}}
				resetAppState={() => {}}
				mapButtons={
					<MapButtons
						renderedUpon={"Settings Modal"}
						openStylesCard={show.stylesCard}
						setOpenStylesCard={() => {}}
						onCloseSidebar={() => {}}
						onOpenSignInModal={() => {}}
						onShowGridLoader={() => {}}
						isLoading={true}
						isAuthGeofenceBoxOpen={show.authGeofenceBox}
						onSetShowAuthGeofenceBox={() => {}}
						isAuthTrackerBoxOpen={show.authTrackerBox}
						onSetShowAuthTrackerBox={() => {}}
						isUnauthGeofenceBoxOpen={show.unauthGeofenceBox}
						isUnauthTrackerBoxOpen={show.unauthTrackerBox}
						onSetShowUnauthGeofenceBox={() => {}}
						onSetShowUnauthTrackerBox={() => {}}
					/>
				}
			/>
			<Flex className="logo-stroke-container">
				<LogoLight />
			</Flex>
		</View>
	);
};

export default DemoPlaceholderPage;
