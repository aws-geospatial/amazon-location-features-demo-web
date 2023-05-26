/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useCallback, useMemo, useState } from "react";

import { Button, CheckboxField, Divider, Flex, Link, Radio, Text, View } from "@aws-amplify/ui-react";
import {
	IconAwsCloudFormation,
	IconCloud,
	IconMapOutlined,
	IconPaintroller,
	IconPeopleArrows,
	IconShuffle
} from "@demo/assets";
import { Modal, TextEl } from "@demo/atomicui/atoms";
import { InputField } from "@demo/atomicui/molecules";
import { appConfig, connectAwsAccountData } from "@demo/core/constants";
import { useAmplifyAuth, useAmplifyMap, useAws, useAwsIot, usePersistedData } from "@demo/hooks";
import {
	ConnectFormValuesType,
	EsriMapEnum,
	GrabMapEnum,
	HereMapEnum,
	MapProviderEnum,
	MapUnitEnum,
	SettingOptionEnum,
	SettingOptionItemType
} from "@demo/types";
import "./styles.scss";

const {
	ENV: { CF_TEMPLATE },
	ROUTES: { HELP },
	MAP_RESOURCES: {
		MAP_STYLES: { ESRI_STYLES, HERE_STYLES, GRAB_STYLES },
		GRAB_SUPPORTED_AWS_REGIONS
	},
	LINKS: { AWS_TERMS_AND_CONDITIONS }
} = appConfig;
const { TITLE, TITLE_DESC, HOW_TO, STEP1, STEP1_DESC, STEP2, STEP2_DESC, STEP3, STEP3_DESC, AGREE } =
	connectAwsAccountData;
const { IMPERIAL, METRIC } = MapUnitEnum;
const { ESRI, HERE, GRAB } = MapProviderEnum;

interface SettingsModalProps {
	open: boolean;
	onClose: () => void;
	resetAppState: () => void;
	isGrabVisible: boolean;
	handleMapProviderChange: (mapProvider: MapProviderEnum) => void;
	handleMapStyleChange: (mapStyle: EsriMapEnum | HereMapEnum | GrabMapEnum) => void;
	handleCurrentLocationAndViewpoint: (b: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
	open,
	onClose,
	resetAppState,
	isGrabVisible,
	handleMapProviderChange,
	handleMapStyleChange,
	handleCurrentLocationAndViewpoint
}) => {
	const [selectedOption, setSelectedOption] = useState<SettingOptionEnum>(SettingOptionEnum.UNITS);
	const {
		isAutomaticMapUnit,
		setIsAutomaticMapUnit,
		mapUnit: currentMapUnit,
		setMapUnit,
		mapProvider: currentMapProvider,
		mapStyle: currentMapStyle,
		setMapProvider,
		setMapStyle
	} = useAmplifyMap();
	const { defaultRouteOptions, setDefaultRouteOptions } = usePersistedData();
	const [formValues, setFormValues] = useState<ConnectFormValuesType>({
		IdentityPoolId: "",
		UserDomain: "",
		UserPoolClientId: "",
		UserPoolId: "",
		WebSocketUrl: ""
	});
	const {
		isUserAwsAccountConnected,
		validateFormValues,
		clearCredentials,
		setIsUserAwsAccountConnected,
		onDisconnectAwsAccount,
		setConnectFormValues,
		credentials,
		onLogin,
		setAuthTokens,
		onLogout
	} = useAmplifyAuth();
	const { resetStore: resetAwsStore } = useAws();
	const { detachPolicy } = useAwsIot();
	const keyArr = Object.keys(formValues);
	const isAuthenticated = !!credentials?.authenticated;

	const handleAutoMapUnitChange = useCallback(() => {
		setIsAutomaticMapUnit(true);
		resetAppState();
	}, [setIsAutomaticMapUnit, resetAppState]);

	const onMapUnitChange = useCallback(
		(mapUnit: MapUnitEnum) => {
			setIsAutomaticMapUnit(false);
			setMapUnit(mapUnit);
			resetAppState();
		},
		[setIsAutomaticMapUnit, setMapUnit, resetAppState]
	);

	const _onLogin = useCallback(async () => await onLogin(), [onLogin]);

	const _onDisconnectAwsAccount = useCallback(
		() => onDisconnectAwsAccount(resetAwsStore),
		[onDisconnectAwsAccount, resetAwsStore]
	);

	const _onLogout = useCallback(async () => {
		setAuthTokens(undefined);
		await detachPolicy(credentials!.identityId);
		await onLogout();
	}, [setAuthTokens, detachPolicy, credentials, onLogout]);

	const isBtnEnabled = useMemo(
		() => keyArr.filter(key => !!formValues[key as keyof typeof formValues]).length === keyArr.length,
		[formValues, keyArr]
	);

	const onChangeFormValues = useCallback(
		(key: string, value: string) => {
			setFormValues({ ...formValues, [key as keyof ConnectFormValuesType]: value });
		},
		[setFormValues, formValues]
	);

	const onConnect = useCallback(() => {
		const {
			IdentityPoolId: identityPoolId,
			UserPoolId: userPoolId,
			UserPoolClientId: userPoolWebClientId,
			UserDomain: domain,
			WebSocketUrl: webSocketUrl
		} = formValues;

		validateFormValues(
			identityPoolId,
			userPoolId,
			userPoolWebClientId,
			domain.slice(8),
			webSocketUrl,
			/* Success callback */
			() => {
				if (
					currentMapProvider === MapProviderEnum.GRAB &&
					!GRAB_SUPPORTED_AWS_REGIONS.includes(identityPoolId.split(":")[0])
				) {
					setMapProvider(MapProviderEnum.ESRI);
					setMapStyle(EsriMapEnum.ESRI_LIGHT);
					handleCurrentLocationAndViewpoint(false);
				}

				setConnectFormValues(formValues);
				clearCredentials();
				resetAwsStore();
				setIsUserAwsAccountConnected(true);
			}
		);
	}, [
		formValues,
		validateFormValues,
		currentMapProvider,
		setMapProvider,
		setMapStyle,
		handleCurrentLocationAndViewpoint,
		setConnectFormValues,
		clearCredentials,
		resetAwsStore,
		setIsUserAwsAccountConnected
	]);

	const selectedMapStyle = useMemo(
		() =>
			currentMapProvider === ESRI
				? ESRI_STYLES.find(({ id }) => id === currentMapStyle)?.name
				: HERE_STYLES.find(({ id }) => id === currentMapStyle)?.name,
		[currentMapProvider, currentMapStyle]
	);

	const optionItems: Array<SettingOptionItemType> = useMemo(
		() => [
			{
				id: SettingOptionEnum.UNITS,
				title: SettingOptionEnum.UNITS,
				defaultValue: currentMapUnit,
				icon: <IconPeopleArrows />,
				detailsComponent: (
					<Flex
						data-testid={`${SettingOptionEnum.UNITS}-details-component`}
						gap={0}
						direction="column"
						padding="0rem 1.15rem"
					>
						<Flex gap={0} padding="1.08rem 0rem">
							<Radio
								data-testid="unit-automatic-radio"
								value={"Automatic"}
								checked={isAutomaticMapUnit}
								onChange={handleAutoMapUnitChange}
							>
								<TextEl marginLeft="1.23rem" text={"Automatic"} />
							</Radio>
						</Flex>
						<Flex gap={0} padding="1.08rem 0rem">
							<Radio
								data-testid="unit-imperial-radio"
								value={IMPERIAL}
								checked={!isAutomaticMapUnit && currentMapUnit === IMPERIAL}
								onChange={() => onMapUnitChange(IMPERIAL)}
							>
								<TextEl marginLeft="1.23rem" text={IMPERIAL} />
								<TextEl variation="tertiary" marginLeft="1.23rem" text={"Miles, pounds"} />
							</Radio>
						</Flex>
						<Flex gap={0} padding="1.08rem 0rem">
							<Radio
								data-testid="unit-metric-radio"
								value={METRIC}
								checked={!isAutomaticMapUnit && currentMapUnit === METRIC}
								onChange={() => onMapUnitChange(METRIC)}
							>
								<TextEl marginLeft="1.23rem" text={METRIC} />
								<TextEl variation="tertiary" marginLeft="1.23rem" text={"Kilometers, kilograms"} />
							</Radio>
						</Flex>
					</Flex>
				)
			},
			{
				id: SettingOptionEnum.DATA_PROVIDER,
				title: SettingOptionEnum.DATA_PROVIDER,
				defaultValue: currentMapProvider,
				icon: <IconMapOutlined />,
				detailsComponent: (
					<Flex
						data-testid={`${SettingOptionEnum.DATA_PROVIDER}-details-component`}
						gap={0}
						direction="column"
						padding="0rem 1.15rem"
					>
						{/* Esri */}
						<Flex gap={0} padding="1.08rem 0rem">
							<Radio
								data-testid="data-provider-esri-radio"
								value={ESRI}
								checked={currentMapProvider === ESRI}
								onChange={() => handleMapProviderChange(ESRI)}
							>
								<TextEl marginLeft="1.23rem" text={ESRI} />
							</Radio>
						</Flex>
						{/* HERE */}
						<Flex gap={0} padding="1.08rem 0rem">
							<Radio
								data-testid="data-provider-here-radio"
								value={HERE}
								checked={currentMapProvider === HERE}
								onChange={() => handleMapProviderChange(HERE)}
							>
								<TextEl marginLeft="1.23rem" text={HERE} />
							</Radio>
						</Flex>
						{/* Grab */}
						{isGrabVisible && (
							<Flex gap={0} padding="1.08rem 0rem">
								<Radio
									data-testid="data-provider-grab-radio"
									value={GRAB}
									checked={currentMapProvider === GRAB}
									onChange={() => handleMapProviderChange(GRAB)}
								>
									<TextEl marginLeft="1.23rem" text={GRAB} />
								</Radio>
							</Flex>
						)}
					</Flex>
				)
			},
			{
				id: SettingOptionEnum.MAP_STYLE,
				title: SettingOptionEnum.MAP_STYLE,
				defaultValue: selectedMapStyle,
				icon: <IconPaintroller />,
				detailsComponent: (
					<Flex
						data-testid={`${SettingOptionEnum.MAP_STYLE}-details-component`}
						gap={0}
						direction="column"
						padding="0rem 1.15rem"
						overflow="scroll"
					>
						{/* Esri */}
						<Flex gap={0} direction="column" padding="0.82rem 0rem 1.23rem 0rem">
							<TextEl fontSize="1rem" lineHeight="1.38rem" variation="tertiary" text={ESRI} />
							<Flex className="sm-styles-container">
								{ESRI_STYLES.map(({ id, image, name }) => (
									<Flex
										data-testid="esri-map-style"
										key={id}
										className={id === currentMapStyle ? "sm-style selected" : "sm-style"}
										onClick={() => handleMapStyleChange(id)}
									>
										<img src={image} />
										<TextEl marginTop="0.62rem" text={name} />
									</Flex>
								))}
							</Flex>
						</Flex>
						{/* HERE */}
						<Divider className="styles-divider" />
						<Flex gap={0} direction="column" padding="1.31rem 0rem 1.23rem 0rem">
							<TextEl fontSize="1rem" lineHeight="1.38rem" variation="tertiary" text={HERE} />
							<Flex className="sm-styles-container">
								{HERE_STYLES.map(({ id, image, name }) => (
									<Flex
										data-testid="here-map-style"
										key={id}
										className={id === currentMapStyle ? "sm-style selected" : "sm-style"}
										onClick={() => handleMapStyleChange(id)}
									>
										<img src={image} />
										<TextEl marginTop="0.62rem" text={name} />
									</Flex>
								))}
							</Flex>
						</Flex>
						{/* Grab */}
						{isGrabVisible && (
							<>
								<Divider className="styles-divider" />
								<Flex gap={0} direction="column" padding="1.31rem 0rem 1.23rem 0rem">
									<TextEl fontSize="1rem" lineHeight="1.38rem" variation="tertiary" text={GRAB} />
									<Flex className="sm-styles-container">
										{GRAB_STYLES.map(({ id, image, name }) => (
											<Flex
												data-testid="gran-map-style"
												key={id}
												className={id === currentMapStyle ? "sm-style selected" : "sm-style"}
												onClick={() => handleMapStyleChange(id)}
											>
												<img src={image} />
												<TextEl marginTop="0.62rem" text={name} />
											</Flex>
										))}
									</Flex>
								</Flex>
							</>
						)}
					</Flex>
				)
			},
			{
				id: SettingOptionEnum.ROUTE_OPTIONS,
				title: SettingOptionEnum.ROUTE_OPTIONS,
				icon: <IconShuffle />,
				detailsComponent: (
					<Flex
						data-testid={`${SettingOptionEnum.ROUTE_OPTIONS}-details-component`}
						gap={0}
						direction="column"
						padding="0rem 1.15rem"
					>
						<CheckboxField
							data-testid="avoid-tolls"
							className="sm-checkbox"
							label="Avoid tolls"
							name="Avoid tolls"
							value="Avoid tolls"
							checked={defaultRouteOptions.avoidTolls}
							onChange={e => setDefaultRouteOptions({ ...defaultRouteOptions, avoidTolls: e.target.checked })}
						/>
						<CheckboxField
							data-testid="avoid-ferries"
							className="sm-checkbox"
							label="Avoid ferries"
							name="Avoid ferries"
							value="Avoid ferries"
							checked={defaultRouteOptions.avoidFerries}
							onChange={e => setDefaultRouteOptions({ ...defaultRouteOptions, avoidFerries: e.target.checked })}
						/>
					</Flex>
				)
			},
			{
				id: SettingOptionEnum.AWS_CLOUD_FORMATION,
				title: TITLE,
				icon: <IconCloud />,
				detailsComponent: (
					<Flex
						data-testid={`${SettingOptionEnum.AWS_CLOUD_FORMATION}-details-component`}
						className="sm-aws-cloudformation-container"
					>
						<Flex gap={0} padding="0rem 1.23rem 0rem 1.62rem" backgroundColor="var(--light-color-2)">
							<IconAwsCloudFormation
								style={{
									width: "2.46rem",
									height: "2.46rem",
									minWidth: "2.46rem",
									minHeight: "2.46rem",
									margin: "1.85rem 1.62rem 2rem 0rem"
								}}
							/>
							<Flex gap={0} direction="column" marginTop="1.23rem">
								<Text marginTop="0.31rem" variation="tertiary" whiteSpace="pre-line">
									{TITLE_DESC}
								</Text>
							</Flex>
						</Flex>
						<Flex className="sm-aws-cloudformation-form">
							<TextEl
								fontFamily="AmazonEmber-Bold"
								fontSize="1.23rem"
								lineHeight="1.85rem"
								marginBottom="1.38rem"
								alignSelf="flex-start"
								text={HOW_TO}
							/>
							<Flex gap={0} marginBottom="1.85rem" alignSelf="flex-start">
								<View className="step-number">
									<TextEl fontFamily="AmazonEmber-Bold" text="1" />
								</View>
								<View>
									<Flex gap={5}>
										<Text className="bold">
											<Link href={CF_TEMPLATE} target="_blank">
												Click here
											</Link>
											{STEP1}
										</Text>
									</Flex>
									<TextEl className="step-two-description" text={STEP1_DESC} />
								</View>
							</Flex>
							<Flex gap={0} marginBottom="1.85rem" alignSelf="flex-start">
								<View className="step-number">
									<TextEl fontFamily="AmazonEmber-Bold" text="2" />
								</View>
								<View>
									<TextEl fontFamily="AmazonEmber-Bold" text={STEP2} />
									<Text className="step-two-description">
										{STEP2_DESC}
										<a href={HELP} target="_blank" rel="noreferrer">
											Learn more
										</a>
									</Text>
								</View>
							</Flex>
							<Flex gap={0} marginBottom="1.85rem" alignSelf="flex-start">
								<View className="step-number">
									<TextEl fontFamily="AmazonEmber-Bold" text="3" />
								</View>
								<View>
									<TextEl fontFamily="AmazonEmber-Bold" text={STEP3} />
									<TextEl className="step-two-description" text={STEP3_DESC} />
								</View>
							</Flex>
							{isUserAwsAccountConnected ? (
								!isAuthenticated ? (
									<>
										<Button variation="primary" fontFamily="AmazonEmber-Bold" width="100%" onClick={_onLogin}>
											Sign in
										</Button>
										<Button
											variation="primary"
											fontFamily="AmazonEmber-Bold"
											width="100%"
											backgroundColor="var(--red-color)"
											marginTop="0.62rem"
											onClick={_onDisconnectAwsAccount}
										>
											Disconnect AWS Account
										</Button>
									</>
								) : (
									<Button variation="primary" fontFamily="AmazonEmber-Bold" width="100%" onClick={_onLogout}>
										Sign out
									</Button>
								)
							) : (
								<>
									{keyArr.map(key => {
										return (
											<InputField
												key={key}
												containerMargin="0rem 0rem 1.85rem 0rem"
												label={key}
												placeholder={`Enter ${key}`}
												value={formValues[key as keyof ConnectFormValuesType]}
												onChange={e => onChangeFormValues(key, e.target.value.trim())}
											/>
										);
									})}
									<Button variation="primary" width="100%" isDisabled={!isBtnEnabled} onClick={onConnect}>
										Connect
									</Button>
									<TextEl marginTop="0.62rem" text={AGREE} />
									<View onClick={() => window.open(AWS_TERMS_AND_CONDITIONS, "_blank")}>
										<TextEl className="hyperlink" fontFamily="AmazonEmber-Bold" text="Terms & Conditions" />
									</View>
								</>
							)}
						</Flex>
					</Flex>
				)
			}
		],
		[
			currentMapUnit,
			isAutomaticMapUnit,
			isGrabVisible,
			handleAutoMapUnitChange,
			onMapUnitChange,
			currentMapProvider,
			handleMapProviderChange,
			selectedMapStyle,
			currentMapStyle,
			handleMapStyleChange,
			defaultRouteOptions,
			setDefaultRouteOptions,
			isUserAwsAccountConnected,
			_onDisconnectAwsAccount,
			onConnect,
			formValues,
			isBtnEnabled,
			keyArr,
			onChangeFormValues,
			isAuthenticated,
			_onLogin,
			_onLogout
		]
	);

	const renderOptionItems = useMemo(() => {
		return optionItems.map(({ id, title, defaultValue, icon }) => (
			<Flex
				data-testid={`option-item-${id}`}
				key={id}
				className={selectedOption === id ? "option-item selected" : "option-item"}
				onClick={() => setSelectedOption(id)}
			>
				{icon}
				<Flex gap={0} direction="column">
					<TextEl fontSize="1rem" lineHeight="1.38rem" text={title} />
					{defaultValue && <TextEl fontSize="1rem" lineHeight="1.38rem" variation="tertiary" text={defaultValue} />}
				</Flex>
			</Flex>
		));
	}, [optionItems, selectedOption]);

	const renderOptionDetails = useMemo(() => {
		const [optionItem] = optionItems.filter(({ id }) => selectedOption === id);

		return (
			<>
				<TextEl fontSize="1rem" lineHeight="1.38rem" padding={"1.46rem 0rem 1.46rem 1.15rem"} text={optionItem.title} />
				<Divider className="title-divider" />
				{optionItem.detailsComponent}
			</>
		);
	}, [optionItems, selectedOption]);

	return (
		<Modal
			data-testid="settings-modal"
			open={open}
			onClose={onClose}
			className="settings-modal"
			content={
				<Flex className="settings-modal-content">
					<Flex className="options-container">
						<TextEl
							fontFamily="AmazonEmber-Bold"
							fontSize="1.23rem"
							lineHeight="1.85rem"
							padding={"1.23rem 0rem 1.23rem 1.23rem"}
							text="Settings"
						/>
						{renderOptionItems}
					</Flex>
					<Divider orientation="vertical" className="col-divider" />
					<Flex className="option-details-container">{renderOptionDetails}</Flex>
				</Flex>
			}
		/>
	);
};

export default SettingsModal;
