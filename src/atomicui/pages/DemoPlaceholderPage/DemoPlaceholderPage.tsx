import React from "react";

import { Divider, Flex, View } from "@aws-amplify/ui-react";
import { IconLocateMe, IconMinus, IconZoomPlus, LogoLight } from "@demo/assets";
import { MapButtons } from "@demo/atomicui/molecules";
import { GeofenceBox, RouteBox, SearchBox, SettingsModal, Sidebar, TrackingBox } from "@demo/atomicui/organisms";
import { MapStyleFilterTypes, ShowStateType } from "@demo/types";
import "./styles.scss";

interface DemoPlaceholderPageProps {
	height: number;
	show: ShowStateType;
	isGrabVisible: boolean;
	searchValue: string;
	selectedFilters: MapStyleFilterTypes;
}

const DemoPlaceholderPage: React.FC<DemoPlaceholderPageProps> = ({
	height,
	show,
	isGrabVisible,
	searchValue,
	selectedFilters
}) => {
	return (
		<View style={{ height }}>
			<View className={"loader-container"}>
				{show.sidebar && (
					<Sidebar
						onCloseSidebar={() => {}}
						onOpenConnectAwsAccountModal={() => {}}
						onOpenSignInModal={() => {}}
						onShowGeofenceBox={() => {}}
						onShowTrackingBox={() => {}}
						onShowSettings={() => {}}
						onShowTrackingDisclaimerModal={() => {}}
						onShowAboutModal={() => {}}
					/>
				)}
				{show.routeBox ? (
					<RouteBox mapRef={null} setShowRouteBox={() => {}} isSideMenuExpanded={show.sidebar} />
				) : show.geofenceBox ? (
					<GeofenceBox mapRef={null} setShowGeofenceBox={() => {}} />
				) : show.trackingBox ? (
					<TrackingBox mapRef={null} setShowTrackingBox={() => {}} />
				) : (
					<SearchBox
						mapRef={null}
						isSideMenuExpanded={show.sidebar}
						onToggleSideMenu={() => {}}
						setShowRouteBox={() => {}}
						isRouteBoxOpen={show.routeBox}
						isGeofenceBoxOpen={show.geofenceBox}
						isTrackingBoxOpen={show.trackingBox}
						isSettingsOpen={show.settings}
						isStylesCardOpen={show.stylesCard}
					/>
				)}
				<MapButtons
					openStylesCard={show.stylesCard}
					setOpenStylesCard={() => {}}
					onCloseSidebar={() => {}}
					onOpenConnectAwsAccountModal={() => {}}
					onOpenSignInModal={() => {}}
					onShowGeofenceBox={() => {}}
					isGrabVisible={isGrabVisible}
					showGrabDisclaimerModal={show.grabDisclaimerModal}
					onShowGridLoader={() => {}}
					handleMapStyleChange={() => {}}
					searchValue={searchValue}
					setSearchValue={() => {}}
					selectedFilters={selectedFilters}
					setSelectedFilters={() => {}}
					isLoading={true}
				/>
				<Flex className="location-disabled">
					<IconLocateMe />
				</Flex>
				<Flex className={"navigation-control"}>
					<IconZoomPlus />
					<Divider backgroundColor={"#DDDDDD"} size="small" opacity="0.3" />
					<IconMinus />
				</Flex>
			</View>
			<SettingsModal
				open={show.settings}
				onClose={() => {}}
				resetAppState={() => {}}
				isGrabVisible={isGrabVisible}
				handleMapProviderChange={() => {}}
				handleMapStyleChange={() => {}}
				handleCurrentLocationAndViewpoint={() => {}}
				mapButtons={
					<MapButtons
						openStylesCard={show.stylesCard}
						setOpenStylesCard={() => {}}
						onCloseSidebar={() => {}}
						onOpenConnectAwsAccountModal={() => {}}
						onOpenSignInModal={() => {}}
						onShowGeofenceBox={() => {}}
						isGrabVisible={isGrabVisible}
						showGrabDisclaimerModal={show.grabDisclaimerModal}
						onShowGridLoader={() => {}}
						handleMapStyleChange={() => {}}
						searchValue={searchValue}
						setSearchValue={() => {}}
						selectedFilters={selectedFilters}
						setSelectedFilters={() => {}}
						isLoading={true}
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
