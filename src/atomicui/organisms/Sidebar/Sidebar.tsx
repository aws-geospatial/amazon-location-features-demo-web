/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { Button, Card, Flex, Text, View } from "@aws-amplify/ui-react";
import { IconClose, IconCompass, IconGear, IconGeofence, IconInfo, IconLockSolid, IconRoute } from "@demo/assets";
import { List, Logo } from "@demo/atomicui/atoms";
import { sideBarMenuOptions } from "@demo/core/constants";
import appConfig from "@demo/core/constants/appConfig";
import { useAmplifyAuth, useAmplifyMap, useAws, useAwsIot } from "@demo/hooks";
import { MapProviderEnum } from "@demo/types";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "react-tooltip";

import "./styles.scss";

interface Props {
	onCloseSidebar: () => void;
	onOpenConnectAwsAccountModal: () => void;
	onOpenSignInModal: () => void;
	onShowGeofenceBox: () => void;
	onShowTrackingBox: () => void;
	onShowSettings: () => void;
	onShowTrackingDisclaimerModal: () => void;
	onShowAboutModal: () => void;
}

const {
	ROUTES: { DEMO, OVERVIEW }
} = appConfig;

const Sidebar: React.FC<Props> = ({
	onCloseSidebar,
	onOpenConnectAwsAccountModal,
	onOpenSignInModal,
	onShowGeofenceBox,
	onShowTrackingBox,
	onShowSettings,
	onShowTrackingDisclaimerModal,
	onShowAboutModal
}) => {
	const { isUserAwsAccountConnected, credentials, onLogin, onLogout, onDisconnectAwsAccount, setAuthTokens } =
		useAmplifyAuth();
	const { mapProvider } = useAmplifyMap();
	const { resetStore: resetAwsStore } = useAws();
	const { detachPolicy } = useAwsIot();
	const navigate = useNavigate();
	const isAuthenticated = !!credentials?.authenticated;

	const onConnectAwsAccount = () => {
		onCloseSidebar();
		onOpenConnectAwsAccountModal();
	};

	const onClickLockItem = () => {
		if (isUserAwsAccountConnected) {
			onCloseSidebar();
			!isAuthenticated && onOpenSignInModal();
		} else {
			onConnectAwsAccount();
		}
	};

	const onClickGeofence = () => {
		if (isAuthenticated) {
			onCloseSidebar();
			onShowGeofenceBox();
		} else {
			onClickLockItem();
		}
	};

	const onClickTracking = () => {
		if (isAuthenticated) {
			onCloseSidebar();
			mapProvider === MapProviderEnum.ESRI ? onShowTrackingDisclaimerModal() : onShowTrackingBox();
		} else {
			onClickLockItem();
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

	const _onLogout = async () => {
		setAuthTokens(undefined);
		await detachPolicy(credentials!.identityId);
		await onLogout();
	};

	const _onLogin = async () => await onLogin();

	const _onDisconnectAwsAccount = () => onDisconnectAwsAccount(resetAwsStore);

	return (
		<Card data-testid="side-bar" className="side-bar">
			<Flex className="title-bar">
				<Logo
					width="100%"
					style={{
						padding: "16px 20px",
						cursor: "pointer"
					}}
					onClick={() => navigate(OVERVIEW)}
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
					<Text>Demo</Text>
				</Flex>
				<Flex className="link-item" onClick={onClickGeofence}>
					<IconGeofence className="menu-icon" />
					<Text>Geofence</Text>
					{!isAuthenticated && (
						<Flex className="locked-item">
							<IconLockSolid
								className="lock-icon"
								data-tooltip-id="geofence-lock"
								data-tooltip-place="top"
								data-tooltip-content="Sign in to your AWS account is required"
							/>
							<Tooltip id="geofence-lock" />
						</Flex>
					)}
				</Flex>
				<Flex className="link-item" onClick={onClickTracking}>
					<IconRoute className="menu-icon" />
					<Text>Tracker</Text>
					{!isAuthenticated && (
						<Flex className="locked-item">
							<IconLockSolid
								className="lock-icon"
								data-tooltip-id="tracker-lock"
								data-tooltip-place="top"
								data-tooltip-content="Sign in to your AWS account is required"
							/>
							<Tooltip id="tracker-lock" />
						</Flex>
					)}
				</Flex>
				<Flex className="link-item" onClick={onClickSettings}>
					<IconGear className="menu-icon" />
					<Text>Settings</Text>
				</Flex>
				<Flex className="link-item" onClick={onClickMore}>
					<IconInfo className="menu-icon" />
					<Text>About</Text>
				</Flex>
			</View>
			<List listArray={sideBarMenuOptions} className="verticle-list side-bar__external-menu" hideIcons />
			<View className="button-wrapper">
				{isUserAwsAccountConnected && (
					<Button variation="primary" fontFamily="AmazonEmber-Bold" onClick={isAuthenticated ? _onLogout : _onLogin}>
						{isAuthenticated ? "Sign out" : "Sign in"}
					</Button>
				)}
				{!isUserAwsAccountConnected && (
					<Button variation="primary" fontFamily="AmazonEmber-Bold" onClick={onConnectAwsAccount}>
						Connect AWS Account
					</Button>
				)}
				{isUserAwsAccountConnected && !isAuthenticated && (
					<Button
						variation="primary"
						fontFamily="AmazonEmber-Bold"
						className="disconnect-button"
						marginTop="8px"
						onClick={_onDisconnectAwsAccount}
					>
						Disconnect AWS Account
					</Button>
				)}
			</View>
		</Card>
	);
};

export default Sidebar;
