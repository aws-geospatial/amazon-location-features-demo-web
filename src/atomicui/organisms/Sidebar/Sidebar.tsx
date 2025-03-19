/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, lazy } from "react";

import { Button, Card, Flex, Text, View } from "@aws-amplify/ui-react";
import { IconClose, IconCompass, IconGear, IconInfo, IconRadar } from "@demo/assets/svgs";
import { appConfig, marketingMenuOptionsData } from "@demo/core/constants";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "./styles.scss";

const List = lazy(() => import("@demo/atomicui/atoms/List").then(module => ({ default: module.List })));
const Logo = lazy(() => import("@demo/atomicui/atoms/Logo").then(module => ({ default: module.Logo })));

const {
	ROUTES: { DEFAULT, DEMO }
} = appConfig;

export interface SidebarProps {
	onCloseSidebar: () => void;
	onShowSettings: () => void;
	onShowAboutModal: () => void;
	onShowUnauthSimulation: () => void;
	onOpenFeedbackModal: () => void;
}

const Sidebar: FC<SidebarProps> = ({
	onCloseSidebar,
	onShowSettings,
	onShowAboutModal,
	onShowUnauthSimulation,
	onOpenFeedbackModal
}) => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	const onClickFeedbackButton = () => {
		onCloseSidebar();
		onOpenFeedbackModal();
	};

	const onClickUnauthSimulation = () => {
		onCloseSidebar();
		onShowUnauthSimulation();
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
					<Text>{t("navigate.text")}</Text>
				</Flex>
				<Flex className="link-item" onClick={() => onClickUnauthSimulation()}>
					<IconRadar className="menu-icon" />
					<Text>{t("trackers.text")}</Text>
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
