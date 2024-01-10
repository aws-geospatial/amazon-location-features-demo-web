import React from "react";

import { Divider, Flex, View } from "@aws-amplify/ui-react";
import { IconLocateMe, IconMinus, IconZoomPlus, LogoLight } from "@demo/assets";
import { MapButtons } from "@demo/atomicui/molecules";
import {
	AuthGeofenceBox,
	AuthTrackerBox,
	RouteBox,
	SearchBox,
	SettingsModal,
	Sidebar,
	UnauthSimulation
} from "@demo/atomicui/organisms";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import { MapStyleFilterTypes, MenuItemEnum, ShowStateType } from "@demo/types";
import "./styles.scss";

interface DemoPlaceholderPageProps {
	show: ShowStateType;
	isGrabVisible: boolean;
	searchValue: string;
	selectedFilters: MapStyleFilterTypes;
	value: string;
	setValue: (value: string) => void;
}

const DemoPlaceholderPage: React.FC<DemoPlaceholderPageProps> = ({
	show,
	isGrabVisible,
	searchValue,
	selectedFilters,
	value,
	setValue
}) => {
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
								onShowAuthTrackerDisclaimerModal={() => {}}
								onShowAuthTrackerBox={() => {}}
								onShowUnauthSimulationDisclaimerModal={() => {}}
								onShowUnauthGeofenceBox={() => {}}
								onShowUnauthTrackerBox={() => {}}
								onOpenFeedbackModal={() => {}}
							/>
						)}
						{show.routeBox ? (
							<RouteBox mapRef={null} setShowRouteBox={() => {}} isSideMenuExpanded={show.sidebar} />
						) : show.authGeofenceBox ? (
							<AuthGeofenceBox
								mapRef={null}
								setShowAuthGeofenceBox={() => {}}
								isEditingAuthRoute={false}
								setIsEditingAuthRoute={() => {}}
							/>
						) : show.authTrackerBox ? (
							<AuthTrackerBox mapRef={null} setShowAuthTrackerBox={() => {}} />
						) : show.unauthGeofenceBox || show.unauthTrackerBox ? (
							<UnauthSimulation
								mapRef={null}
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
								mapRef={null}
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
					isGrabVisible={isGrabVisible}
					showGrabDisclaimerModal={false}
					onShowGridLoader={() => {}}
					handleMapStyleChange={() => {}}
					searchValue={searchValue}
					setSearchValue={() => {}}
					selectedFilters={selectedFilters}
					setSelectedFilters={() => {}}
					isLoading={true}
					showOpenDataDisclaimerModal={false}
					isAuthGeofenceBoxOpen={show.authGeofenceBox}
					onSetShowAuthGeofenceBox={() => {}}
					isAuthTrackerDisclaimerModalOpen={show.authTrackerDisclaimerModal}
					isAuthTrackerBoxOpen={show.authTrackerBox}
					onShowAuthTrackerDisclaimerModal={() => {}}
					onSetShowAuthTrackerBox={() => {}}
					onShowUnauthSimulationDisclaimerModal={() => {}}
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
				isGrabVisible={isGrabVisible}
				handleMapProviderChange={() => {}}
				handleCurrentLocationAndViewpoint={() => {}}
				mapButtons={
					<MapButtons
						renderedUpon={"Settings Modal"}
						openStylesCard={show.stylesCard}
						setOpenStylesCard={() => {}}
						onCloseSidebar={() => {}}
						onOpenSignInModal={() => {}}
						isGrabVisible={isGrabVisible}
						showGrabDisclaimerModal={false}
						onShowGridLoader={() => {}}
						handleMapStyleChange={() => {}}
						searchValue={searchValue}
						setSearchValue={() => {}}
						selectedFilters={selectedFilters}
						setSelectedFilters={() => {}}
						isLoading={true}
						showOpenDataDisclaimerModal={false}
						isAuthGeofenceBoxOpen={show.authGeofenceBox}
						onSetShowAuthGeofenceBox={() => {}}
						isAuthTrackerDisclaimerModalOpen={show.authTrackerDisclaimerModal}
						isAuthTrackerBoxOpen={show.authTrackerBox}
						onShowAuthTrackerDisclaimerModal={() => {}}
						onShowUnauthSimulationDisclaimerModal={() => {}}
						onSetShowAuthTrackerBox={() => {}}
						isUnauthGeofenceBoxOpen={show.unauthGeofenceBox}
						isUnauthTrackerBoxOpen={show.unauthTrackerBox}
						onSetShowUnauthGeofenceBox={() => {}}
						onSetShowUnauthTrackerBox={() => {}}
					/>
				}
				resetSearchAndFilters={() => {}}
			/>
			<Flex className="logo-stroke-container">
				<LogoLight />
			</Flex>
		</View>
	);
};

export default DemoPlaceholderPage;
