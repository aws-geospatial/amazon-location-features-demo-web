/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, lazy } from "react";

import { Button, Card, Flex, Text, View } from "@aws-amplify/ui-react";
import { IconClose, IconCompass, IconGear, IconGeofence, IconInfo, IconRadar } from "@demo/assets/svgs";
import { appConfig, marketingMenuOptionsData } from "@demo/core/constants";
import useBottomSheet from "@demo/hooks/useBottomSheet";
import { MenuItemEnum } from "@demo/types";
import { ResponsiveUIEnum } from "@demo/types/Enums";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./styles.scss";

const List = lazy(() => import("@demo/atomicui/atoms/List").then(module => ({ default: module.List })));
const Logo = lazy(() => import("@demo/atomicui/atoms/Logo").then(module => ({ default: module.Logo })));

const {
	ROUTES: { DEFAULT, DEMO }
} = appConfig;

interface SidebarProps {
	onCloseSidebar: () => void;
	onShowSettings: () => void;
	onShowAboutModal: () => void;
	onShowUnauthGeofenceBox: () => void;
	onShowUnauthTrackerBox: () => void;
	onOpenFeedbackModal: () => void;
}

const Sidebar: FC<SidebarProps> = ({
	onCloseSidebar,
	onShowSettings,
	onShowAboutModal,
	onShowUnauthGeofenceBox,
	onShowUnauthTrackerBox,
	onOpenFeedbackModal
}) => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const { setUI } = useBottomSheet();

	const onClickFeedbackButton = () => {
		onCloseSidebar();
		onOpenFeedbackModal();
	};

	const onClickMenuItem = (menuItem: MenuItemEnum) => {
		onCloseSidebar();

		if (menuItem === MenuItemEnum.GEOFENCE) {
			onShowUnauthGeofenceBox();
		} else {
			onShowUnauthTrackerBox();
			setUI(ResponsiveUIEnum.non_start_unauthorized_tracker);
		}
	};

	const onClickSettings = () => {
		onCloseSidebar();
		onShowSettings();
	};

	const onClickMore = () => {
		onCloseSidebar();
		onShowAboutModal();
	};

	return (
		<Card data-testid="side-bar" className="side-bar">
			<Flex className="title-bar">
				<Logo
					width="100%"
					style={{
						padding: "16px 20px",
						cursor: "pointer"
					}}
					onClick={() => navigate(DEFAULT)}
				/>

				<View className="icon-container">
					<IconClose data-testid="icon-close" onClick={onCloseSidebar} />
				</View>
			</Flex>
			<View as="ul" className="side-bar__menu">
				<Flex
					className="link-item"
					onClick={() => {
						navigate(DEMO);
						onCloseSidebar();
					}}
				>
					<IconCompass className="menu-icon" />
					<Text>{t("places_routes_maps.text")}</Text>
				</Flex>
				<Flex className="link-item" onClick={() => onClickMenuItem(MenuItemEnum.GEOFENCE)}>
					<IconGeofence className="menu-icon" />
					<Text>{t("geofence.text")}</Text>
				</Flex>
				<Flex className="link-item" onClick={() => onClickMenuItem(MenuItemEnum.TRACKER)}>
					<IconRadar className="menu-icon" />
					<Text>{t("tracker.text")}</Text>
				</Flex>
				<Flex className="link-item" onClick={onClickSettings}>
					<IconGear className="menu-icon" />
					<Text>{t("settings.text")}</Text>
				</Flex>
				<Flex className="link-item" onClick={onClickMore}>
					<IconInfo className="menu-icon" />
					<Text>{t("about.text")}</Text>
				</Flex>
			</View>
			<List
				listArray={marketingMenuOptionsData}
				className="hideScroll verticle-list side-bar__external-menu"
				hideIcons
			/>
			<View className="button-wrapper">
				<Button
					data-testid="provide-feedback-button"
					variation="primary"
					fontFamily="AmazonEmber-Bold"
					textAlign="center"
					marginTop="0.62rem"
					onClick={() => onClickFeedbackButton()}
				>
					{t("fm__provide_feedback_btn.text")}
				</Button>
			</View>
		</Card>
	);
};

export default Sidebar;
