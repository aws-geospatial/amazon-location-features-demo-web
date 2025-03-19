import { FC, lazy } from "react";

import { Divider, Flex, View } from "@aws-amplify/ui-react";
import { IconLocateMe, IconMinus, IconZoomPlus, LogoLight } from "@demo/assets/svgs";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import { ShowStateType } from "@demo/types";
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
								onShowSettings={() => {}}
								onShowAboutModal={() => {}}
								onShowUnauthSimulation={() => {}}
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
						) : show.unauthSimulation ? (
							<UnauthSimulation
								mapRef={{
									current: {} as MapRef
								}}
								geolocateControlRef={{ current: null }}
								setShowUnauthSimulation={() => {}}
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
					onShowGridLoader={() => {}}
					isLoading={true}
					isUnauthSimulationOpen={show.unauthSimulation}
					onSetShowUnauthSimulation={() => {}}
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
						onShowGridLoader={() => {}}
						isLoading={true}
						isUnauthSimulationOpen={show.unauthSimulation}
						onSetShowUnauthSimulation={() => {}}
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
