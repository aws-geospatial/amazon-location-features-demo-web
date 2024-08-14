/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, lazy, useCallback, useMemo, useState } from "react";

import { Button, CheckboxField, Divider, Flex, Link, Radio, Text, View } from "@aws-amplify/ui-react";
import {
	IconArrow,
	IconAwsCloudFormation,
	IconBackArrow,
	IconCloud,
	IconGlobe,
	IconLanguage,
	IconMapOutlined,
	IconPaintroller,
	IconPeopleArrows,
	IconShuffle
} from "@demo/assets/svgs";
import { appConfig, languageSwitcherData, regionsData } from "@demo/core/constants";
import { useAuth, useClient, useIot, useMap, usePersistedData } from "@demo/hooks";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import {
	ConnectFormValuesType,
	EsriMapEnum,
	MapProviderEnum,
	MapUnitEnum,
	RegionEnum,
	SettingOptionEnum,
	SettingOptionItemType
} from "@demo/types";
import { AnalyticsEventActionsEnum, EventTypeEnum, TriggeredByEnum } from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const DropdownEl = lazy(() =>
	import("@demo/atomicui/atoms/DropdownEl").then(module => ({ default: module.DropdownEl }))
);
const Modal = lazy(() => import("@demo/atomicui/atoms/Modal").then(module => ({ default: module.Modal })));
const InputField = lazy(() =>
	import("@demo/atomicui/molecules/InputField").then(module => ({ default: module.InputField }))
);

const {
	POOLS,
	ROUTES: { HELP },
	MAP_RESOURCES: {
		MAP_STYLES: { ESRI_STYLES, HERE_STYLES },
		GRAB_SUPPORTED_AWS_REGIONS
	},
	LINKS: { AWS_TERMS_AND_CONDITIONS },
	PERSIST_STORAGE_KEYS: { FASTEST_REGION }
} = appConfig;
const { IMPERIAL, METRIC } = MapUnitEnum;
const { ESRI, HERE, GRAB, OPEN_DATA } = MapProviderEnum;

interface SettingsModalProps {
	open: boolean;
	onClose: () => void;
	resetAppState: () => void;
	isGrabVisible: boolean;
	handleMapProviderChange: (mapProvider: MapProviderEnum, triggeredBy: TriggeredByEnum) => void;
	handleCurrentLocationAndViewpoint: (b: boolean) => void;
	mapButtons: JSX.Element;
	resetSearchAndFilters: () => void;
}

const SettingsModal: FC<SettingsModalProps> = ({
	open,
	onClose,
	resetAppState,
	isGrabVisible,
	handleMapProviderChange,
	handleCurrentLocationAndViewpoint,
	mapButtons,
	resetSearchAndFilters
}) => {
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
		onLogout,
		autoRegion,
		region: currentRegion,
		setAutoRegion,
		stackRegion,
		cloudFormationLink,
		handleStackRegion
	} = useAuth();
	const {
		autoMapUnit,
		setIsAutomaticMapUnit,
		mapUnit: currentMapUnit,
		setMapUnit,
		mapProvider: currentMapProvider,
		mapStyle: currentMapStyle,
		setMapProvider,
		setMapStyle,
		resetStore: resetMapStore
	} = useMap();
	const { defaultRouteOptions, setDefaultRouteOptions, setSettingsOptions, settingsOptions } = usePersistedData();
	const { resetStore: resetClientStore } = useClient();
	const { detachPolicy } = useIot();
	const keyArr = Object.keys(formValues);
	const isAuthenticated = !!credentials?.authenticated;
	const { t, i18n } = useTranslation();
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";
	const fallbackRegion = Object.values(POOLS)[0];
	const fastestRegion = localStorage.getItem(FASTEST_REGION) ?? fallbackRegion;
	const { isDesktop, isMobile } = useDeviceMediaQuery();

	const handleAutoMapUnitChange = useCallback(() => {
		setIsAutomaticMapUnit(true);
		resetAppState();
		record([{ EventType: EventTypeEnum.MAP_UNIT_CHANGE, Attributes: { type: "Automatic" } }]);
	}, [setIsAutomaticMapUnit, resetAppState]);

	const onMapUnitChange = useCallback(
		(mapUnit: MapUnitEnum) => {
			setIsAutomaticMapUnit(false);
			setMapUnit(mapUnit);
			resetAppState();

			record([{ EventType: EventTypeEnum.MAP_UNIT_CHANGE, Attributes: { type: String(mapUnit) } }]);
		},
		[setIsAutomaticMapUnit, setMapUnit, resetAppState]
	);

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
		const { IdentityPoolId: identityPoolId } = formValues;

		validateFormValues(
			identityPoolId,
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
				resetClientStore();
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
		resetClientStore,
		setIsUserAwsAccountConnected
	]);

	const selectedMapStyle = useMemo(
		() =>
			currentMapProvider === ESRI
				? ESRI_STYLES.find(({ id }) => id === currentMapStyle)?.name
				: HERE_STYLES.find(({ id }) => id === currentMapStyle)?.name,
		[currentMapProvider, currentMapStyle]
	);

	const _onSelect = useCallback(
		(option: { value: string; label: string }) => {
			handleStackRegion(option);
		},
		[handleStackRegion]
	);

	const handleLanguageChange = useCallback(
		(e: { target: { value: string } }) => {
			record([
				{
					EventType: EventTypeEnum.LANGUAGE_CHANGED,
					Attributes: { language: e.target.value, triggeredBy: TriggeredByEnum.SETTINGS_MODAL }
				}
			]);
			i18n.changeLanguage(e.target.value);
		},
		[i18n]
	);

	const handleRouteOptionChange = useCallback(
		(e: { target: { checked: boolean } }, routeOption: string) => {
			setDefaultRouteOptions({ ...defaultRouteOptions, [routeOption]: e.target.checked });

			record([
				{
					EventType: EventTypeEnum.ROUTE_OPTION_CHANGED,
					Attributes: {
						option: routeOption,
						status: e.target.checked ? "on" : "off",
						triggeredBy: TriggeredByEnum.SETTINGS_MODAL
					}
				}
			]);
		},
		[defaultRouteOptions, setDefaultRouteOptions]
	);

	const handleRegionChange = useCallback(
		(region: "Automatic" | RegionEnum) => {
			setAutoRegion(region === "Automatic", region);
			resetClientStore();
			resetAppState();
			resetMapStore();
		},
		[setAutoRegion, resetClientStore, resetAppState, resetMapStore]
	);

	const optionItems: Array<SettingOptionItemType> = useMemo(
		() => [
			{
				id: SettingOptionEnum.UNITS,
				title: t("settings_modal__units.text"),
				defaultValue: autoMapUnit.selected
					? (t("settings_modal__automatic.text") as string)
					: currentMapUnit === MapUnitEnum.IMPERIAL
					? (t("settings_modal__imperial.text") as string)
					: (t("settings_modal__metric.text") as string),
				icon: <IconPeopleArrows />,
				detailsComponent: (
					<Flex
						data-testid={`${SettingOptionEnum.UNITS}-details-component`}
						gap={0}
						direction="column"
						padding="0rem 1.15rem"
					>
						<Flex style={{ gap: 0, padding: "1.08rem 0rem", cursor: "pointer" }}>
							<Radio
								data-testid="unit-automatic-radio"
								value={"Automatic"}
								checked={autoMapUnit.selected}
								onChange={handleAutoMapUnitChange}
								crossOrigin={undefined}
							>
								<Text marginLeft="1.23rem">{t("settings_modal__automatic.text")}</Text>
								<Text variation="tertiary" marginLeft="1.23rem">
									{autoMapUnit.system === IMPERIAL
										? t("settings_modal__auto_desc_1.text")
										: t("settings_modal__auto_desc_2.text")}
								</Text>
							</Radio>
						</Flex>
						<Flex style={{ gap: 0, padding: "1.08rem 0rem", cursor: "pointer" }}>
							<Radio
								data-testid="unit-imperial-radio"
								value={IMPERIAL}
								checked={!autoMapUnit.selected && currentMapUnit === IMPERIAL}
								onChange={() => onMapUnitChange(IMPERIAL)}
								crossOrigin={undefined}
							>
								<Text marginLeft="1.23rem">{t("settings_modal__imperial.text")}</Text>
								<Text variation="tertiary" marginLeft="1.23rem">
									{t("settings_modal__imperial_units.text")}
								</Text>
							</Radio>
						</Flex>
						<Flex style={{ gap: 0, padding: "1.08rem 0rem", cursor: "pointer" }}>
							<Radio
								data-testid="unit-metric-radio"
								value={METRIC}
								checked={!autoMapUnit.selected && currentMapUnit === METRIC}
								onChange={() => onMapUnitChange(METRIC)}
								crossOrigin={undefined}
							>
								<Text marginLeft="1.23rem">{t("settings_modal__metric.text")}</Text>
								<Text variation="tertiary" marginLeft="1.23rem">
									{t("settings_modal__metric_units.text")}
								</Text>
							</Radio>
						</Flex>
					</Flex>
				)
			},
			{
				id: SettingOptionEnum.DATA_PROVIDER,
				title: t("settings_modal__data_provider.text"),
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
						<Flex style={{ gap: 0, padding: "1.08rem 0rem", cursor: "pointer" }}>
							<Radio
								data-testid="data-provider-esri-radio"
								value={ESRI}
								checked={currentMapProvider === ESRI}
								onChange={() => handleMapProviderChange(ESRI, TriggeredByEnum.SETTINGS_MODAL)}
								crossOrigin={undefined}
							>
								<Text marginLeft="1.23rem">{ESRI}</Text>
							</Radio>
						</Flex>
						{/* HERE */}
						<Flex style={{ gap: 0, padding: "1.08rem 0rem", cursor: "pointer" }}>
							<Radio
								data-testid="data-provider-here-radio"
								value={HERE}
								checked={currentMapProvider === HERE}
								onChange={() => handleMapProviderChange(HERE, TriggeredByEnum.SETTINGS_MODAL)}
								crossOrigin={undefined}
							>
								<Text marginLeft="1.23rem">{HERE}</Text>
							</Radio>
						</Flex>
						{/* Grab */}
						{isGrabVisible && (
							<Flex style={{ gap: 0, padding: "1.08rem 0rem", cursor: "pointer" }}>
								<Radio
									data-testid="data-provider-grab-radio"
									value={GRAB}
									checked={currentMapProvider === GRAB}
									onChange={() => handleMapProviderChange(GRAB, TriggeredByEnum.SETTINGS_MODAL)}
									crossOrigin={undefined}
								>
									<Text marginLeft="1.23rem">{`${GRAB}Maps`}</Text>
								</Radio>
							</Flex>
						)}
						{/* OpenData */}
						<Flex style={{ gap: 0, padding: "1.08rem 0rem", cursor: "pointer" }}>
							<Radio
								data-testid="data-provider-openData-radio"
								value={OPEN_DATA}
								checked={currentMapProvider === OPEN_DATA}
								onChange={() => handleMapProviderChange(OPEN_DATA, TriggeredByEnum.SETTINGS_MODAL)}
								crossOrigin={undefined}
							>
								<Text marginLeft="1.23rem">{OPEN_DATA}</Text>
							</Radio>
						</Flex>
					</Flex>
				)
			},
			{
				id: SettingOptionEnum.MAP_STYLE,
				title: t("map_style.text"),
				defaultValue: t(selectedMapStyle as string) as string,
				icon: <IconPaintroller />,
				detailsComponent: (
					<Flex
						data-testid={`${SettingOptionEnum.MAP_STYLE}-details-component`}
						gap={0}
						direction="column"
						overflow="hidden scroll"
					>
						{mapButtons}
					</Flex>
				)
			},
			{
				id: SettingOptionEnum.LANGUAGE,
				title: t("language.text"),
				defaultValue: languageSwitcherData.find(({ value }) => value === i18n.language)?.label as string,
				icon: <IconLanguage />,
				detailsComponent: (
					<Flex
						data-testid={`${SettingOptionEnum.UNITS}-details-component`}
						gap={0}
						direction="column"
						padding="0rem 1.15rem"
						overflow="hidden scroll"
						className="language-switcher-container"
					>
						{languageSwitcherData.map(({ value, label }, idx) => (
							<Flex key={idx} style={{ gap: 0, padding: "1.08rem 0rem", cursor: "pointer" }}>
								<Radio
									data-testid="unit-automatic-radio"
									value={value}
									checked={i18n.language === value}
									onChange={handleLanguageChange}
									crossOrigin={undefined}
								>
									<Text marginLeft="1.23rem">{label}</Text>
								</Radio>
							</Flex>
						))}
					</Flex>
				)
			},
			{
				id: SettingOptionEnum.ROUTE_OPTIONS,
				title: t("settings_modal__default_route_options.text"),
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
							label={t("avoid_tolls.text")}
							name={t("avoid_tolls.text")}
							value="Avoid tolls"
							checked={defaultRouteOptions.avoidTolls}
							onChange={e => handleRouteOptionChange(e, "avoidTolls")}
							crossOrigin={undefined}
						/>
						<CheckboxField
							data-testid="avoid-ferries"
							className="sm-checkbox"
							label={t("avoid_ferries.text")}
							name={t("avoid_ferries.text")}
							value="Avoid ferries"
							checked={defaultRouteOptions.avoidFerries}
							onChange={e => handleRouteOptionChange(e, "avoidFerries")}
							crossOrigin={undefined}
						/>
					</Flex>
				)
			},
			{
				id: SettingOptionEnum.REGION,
				title: t("settings_modal__region.text"),
				defaultValue: autoRegion
					? (t("settings_modal__automatic.text") as string)
					: currentRegion === RegionEnum.EU_WEST_1
					? t("regions__eu_west__region.text")
					: currentRegion === RegionEnum.AP_SOUTHEAST_1
					? t("regions__ap_southeast__region.text")
					: t("regions__us_east__region.text"),
				icon: <IconGlobe />,
				detailsComponent: (
					<Flex
						data-testid={`${SettingOptionEnum.REGION}-details-component`}
						gap={0}
						direction="column"
						padding="0rem 1.15rem"
						dir={langDir}
					>
						<Flex style={{ gap: 0, padding: "1.08rem 0rem", cursor: "pointer" }}>
							<Radio
								data-testid="region-automatic-radio"
								value={"Automatic"}
								checked={autoRegion}
								onChange={() => handleRegionChange("Automatic")}
								crossOrigin={undefined}
							>
								<Text marginLeft="1.23rem">{`${t("settings_modal__automatic.text")} - ${fastestRegion}`}</Text>
							</Radio>
						</Flex>
						<Flex style={{ gap: 0, padding: "1.08rem 0rem", cursor: "pointer" }}>
							<Radio
								data-testid={`region-${RegionEnum.EU_WEST_1}-radio`}
								value={RegionEnum.EU_WEST_1}
								checked={!autoRegion && currentRegion === RegionEnum.EU_WEST_1}
								onChange={() => handleRegionChange(RegionEnum.EU_WEST_1)}
								crossOrigin={undefined}
							>
								<Text marginLeft="1.23rem">{t("regions__eu_west_1.text")}</Text>
							</Radio>
						</Flex>
						<Flex style={{ gap: 0, padding: "1.08rem 0rem", cursor: "pointer" }}>
							<Radio
								data-testid={`region-${RegionEnum.AP_SOUTHEAST_1}-radio`}
								value={RegionEnum.AP_SOUTHEAST_1}
								checked={!autoRegion && currentRegion === RegionEnum.AP_SOUTHEAST_1}
								onChange={() => handleRegionChange(RegionEnum.AP_SOUTHEAST_1)}
								crossOrigin={undefined}
							>
								<Text marginLeft="1.23rem">{t("regions__ap_southeast_1.text")}</Text>
							</Radio>
						</Flex>
						<Flex style={{ gap: 0, padding: "1.08rem 0rem", cursor: "pointer" }}>
							<Radio
								data-testid={`region-${RegionEnum.US_EAST_1}-radio`}
								value={RegionEnum.US_EAST_1}
								checked={!autoRegion && currentRegion === RegionEnum.US_EAST_1}
								onChange={() => handleRegionChange(RegionEnum.US_EAST_1)}
								crossOrigin={undefined}
							>
								<Text marginLeft="1.23rem">{t("regions__us_east_1.text")}</Text>
							</Radio>
						</Flex>
					</Flex>
				)
			},
			{
				id: SettingOptionEnum.AWS_CLOUD_FORMATION,
				title: t("connect_aws_account.text"),
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
								<Text marginTop="0.31rem" variation="tertiary" whiteSpace="pre-line" className={isLtr ? "ltr" : "rtl"}>
									{t("caam__desc.text")}
								</Text>
							</Flex>
						</Flex>
						<Flex className="sm-aws-cloudformation-form">
							<Flex
								gap={0}
								justifyContent={isLtr ? "flex-start" : "flex-end"}
								alignItems="center"
								margin="1.85rem 0rem 1.85rem 0rem"
								width="100%"
							>
								<Text
									className={`bold ${isLtr ? "ltr" : "rtl"}`}
									fontSize="1.08rem"
									textAlign={isLtr ? "start" : "end"}
									order={isLtr ? 1 : 2}
								>
									{t("caam__htct.text")}
								</Text>
								<View order={isLtr ? 2 : 1}>
									<DropdownEl defaultOption={stackRegion} options={regionsData} onSelect={_onSelect} showSelected />
								</View>
							</Flex>
							<Flex gap={0} marginBottom="1.85rem" alignSelf="flex-start">
								<View
									className="step-number"
									margin={isLtr ? "0rem 1.23rem 0rem 0rem" : "0rem 0rem 0rem 1.23rem"}
									order={isLtr ? 1 : 2}
								>
									<Text className="bold">1</Text>
								</View>
								<View order={isLtr ? 2 : 1}>
									<Flex gap={5} className={`step-heading-${isLtr ? "" : "rtl"}`}>
										<Text className={`bold ${isLtr ? "ltr" : "rtl"}`}>
											<Link href={cloudFormationLink} target="_blank">
												{t("caam__click_here.text")}
											</Link>{" "}
											{t("caam__step_1__title.text")}
										</Text>
									</Flex>
									<Text className={`step-two-description ${isLtr ? "ltr" : "rtl"}`}>
										{t("caam__step_1__desc.text")}
									</Text>
								</View>
							</Flex>
							<Flex gap={0} marginBottom="1.85rem" alignSelf="flex-start">
								<View
									className="step-number"
									margin={isLtr ? "0rem 1.23rem 0rem 0rem" : "0rem 0rem 0rem 1.23rem"}
									order={isLtr ? 1 : 2}
								>
									<Text className="bold" textAlign={isLtr ? "start" : "end"}>
										2
									</Text>
								</View>
								<View order={isLtr ? 2 : 1}>
									<Text className={`bold ${isLtr ? "ltr" : "rtl"}`}>{t("caam__step_2__title.text")}</Text>
									<Text className={`step-two-description ${isLtr ? "ltr" : "rtl"}`}>
										{t("caam__step_2__desc.text")}
										<a href={HELP} target="_blank" rel="noreferrer">
											{t("learn_more.text")}
										</a>
									</Text>
								</View>
							</Flex>
							<Flex gap={0} marginBottom="1.85rem" alignSelf="flex-start">
								<View
									className="step-number"
									margin={isLtr ? "0rem 1.23rem 0rem 0rem" : "0rem 0rem 0rem 1.23rem"}
									order={isLtr ? 1 : 2}
								>
									<Text className="bold" textAlign={isLtr ? "start" : "end"}>
										3
									</Text>
								</View>
								<View order={isLtr ? 2 : 1}>
									<Text className="bold" textAlign={isLtr ? "start" : "end"}>
										{t("caam__step_3__title.text")}
									</Text>
									<Text className="step-two-description" textAlign={isLtr ? "start" : "end"}>
										{t("caam__step_3__desc.text")}
									</Text>
								</View>
							</Flex>
							{isUserAwsAccountConnected ? (
								!isAuthenticated ? (
									<>
										<Button
											variation="primary"
											fontFamily="AmazonEmber-Bold"
											width="100%"
											onClick={() => {
												record(
													[
														{
															EventType: EventTypeEnum.SIGN_IN_STARTED,
															Attributes: { triggeredBy: TriggeredByEnum.SETTINGS_MODAL }
														}
													],
													["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
												);
												onLogin();
											}}
										>
											{t("sign_in.text")}
										</Button>
										<Button
											variation="primary"
											fontFamily="AmazonEmber-Bold"
											width="100%"
											backgroundColor="var(--red-color)"
											marginTop="0.62rem"
											onClick={onDisconnectAwsAccount}
										>
											{t("disconnect_aws_account.text")}
										</Button>
									</>
								) : (
									<Button
										variation="primary"
										fontFamily="AmazonEmber-Bold"
										width="100%"
										onClick={async () => {
											record(
												[
													{
														EventType: EventTypeEnum.SIGN_OUT_STARTED,
														Attributes: { triggeredBy: TriggeredByEnum.SETTINGS_MODAL }
													}
												],
												["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
											);
											await detachPolicy(credentials!.identityId);
											onLogout();
										}}
									>
										{t("sign_out.text")}
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
												placeholder={`${t("caam__enter.text")} ${key}`}
												value={formValues[key as keyof ConnectFormValuesType]}
												onChange={e => onChangeFormValues(key, e.target.value.trim())}
												dir={langDir}
											/>
										);
									})}
									<Button
										className="aws-connect-button"
										variation="primary"
										width="100%"
										isDisabled={!isBtnEnabled}
										onClick={onConnect}
									>
										{t("caam__connect.text")}
									</Button>
									<Text marginTop="0.62rem">{t("caam__agree.text")}</Text>
									<View onClick={() => window.open(AWS_TERMS_AND_CONDITIONS, "_blank")}>
										<Text className="hyperlink" fontFamily="AmazonEmber-Bold">
											{t("t&c.text")}
										</Text>
									</View>
								</>
							)}
						</Flex>
					</Flex>
				)
			}
		],
		[
			t,
			autoMapUnit.selected,
			autoMapUnit.system,
			currentMapUnit,
			handleAutoMapUnitChange,
			currentMapProvider,
			isGrabVisible,
			selectedMapStyle,
			mapButtons,
			defaultRouteOptions.avoidTolls,
			defaultRouteOptions.avoidFerries,
			autoRegion,
			currentRegion,
			langDir,
			fastestRegion,
			isLtr,
			stackRegion,
			_onSelect,
			cloudFormationLink,
			isUserAwsAccountConnected,
			isAuthenticated,
			onDisconnectAwsAccount,
			keyArr,
			isBtnEnabled,
			onConnect,
			onMapUnitChange,
			handleMapProviderChange,
			i18n.language,
			handleLanguageChange,
			handleRouteOptionChange,
			handleRegionChange,
			onLogin,
			detachPolicy,
			credentials,
			onLogout,
			formValues,
			onChangeFormValues
		]
	);

	const renderOptionItems = useMemo(() => {
		const filtered = optionItems.filter(({ id }) => {
			if (isUserAwsAccountConnected) {
				return id !== SettingOptionEnum.REGION;
			} else {
				return id;
			}
		});

		return filtered.map(({ id, title, defaultValue, icon }) => (
			<Flex
				data-testid={`option-item-${id}`}
				key={id}
				className={`option-item ${!isMobile && settingsOptions === id ? "selected" : ""} ${
					isMobile ? "option-item-mobile" : ""
				}`}
				onClick={() => {
					if (id === SettingOptionEnum.AWS_CLOUD_FORMATION) {
						record(
							[
								{
									EventType: EventTypeEnum.AWS_ACCOUNT_CONNECTION_STARTED,
									Attributes: { triggeredBy: TriggeredByEnum.SETTINGS_MODAL }
								}
							],
							["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
						);
					} else if (settingsOptions === SettingOptionEnum.AWS_CLOUD_FORMATION) {
						const columnsHavingText = Object.keys(formValues)
							.filter(key => !!formValues[key as keyof ConnectFormValuesType].trim())
							.map(valueKey => valueKey)
							.join(",");

						record(
							[
								{
									EventType: EventTypeEnum.AWS_ACCOUNT_CONNECTION_STOPPED,
									Attributes: {
										triggeredBy: TriggeredByEnum.SETTINGS_MODAL,
										fieldsFilled: columnsHavingText,
										action: AnalyticsEventActionsEnum.TAB_CHANGED
									}
								}
							],
							["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
						);
					}

					resetSearchAndFilters();
					setSettingsOptions(id);
				}}
			>
				<Flex gap="0" alignItems="center">
					{icon}
					<Flex gap={0} direction="column">
						<Text fontSize="1rem" lineHeight="1.38rem">
							{title}
						</Text>
						{defaultValue && (
							<Text fontSize="1rem" lineHeight="1.38rem" variation="tertiary">
								{defaultValue}{" "}
							</Text>
						)}
					</Flex>
				</Flex>
				{isMobile && (
					<Flex className="option-arrow">
						<IconArrow />
					</Flex>
				)}
			</Flex>
		));
	}, [
		optionItems,
		isUserAwsAccountConnected,
		settingsOptions,
		isMobile,
		resetSearchAndFilters,
		setSettingsOptions,
		formValues
	]);

	const renderOptionDetails = useMemo(() => {
		const [optionItem] = optionItems.filter(({ id }) => settingsOptions === id);

		if (!optionItem) return null;
		return (
			<>
				<Text className="option-title">
					{isMobile && <IconBackArrow className="grey-icon back-arrow" onClick={() => setSettingsOptions(undefined)} />}
					{optionItem?.title}
				</Text>
				<Divider className="title-divider" />
				{optionItem?.detailsComponent}
			</>
		);
	}, [isMobile, optionItems, setSettingsOptions, settingsOptions]);

	const modalCloseHandler = useCallback(() => {
		!isMobile && setSettingsOptions(SettingOptionEnum.UNITS);
		onClose();
	}, [isMobile, setSettingsOptions, onClose]);

	return (
		<Modal
			data-testid="settings-modal"
			open={open}
			onClose={modalCloseHandler}
			className={`settings-modal ${isMobile ? "settings-modal-mobile" : ""} ${
				!isDesktop ? "settings-modal-tablet" : ""
			} `}
			content={
				<>
					{isMobile && !settingsOptions && (
						<Flex direction="column" className="setting-title-container-mobile">
							<Text className="option-title">
								{isMobile && <IconBackArrow className="grey-icon back-arrow" onClick={modalCloseHandler} />}
								{t("settings.text")}
							</Text>
							<Divider className="title-divider" />
						</Flex>
					)}
					<Flex
						className={`settings-modal-content ${!isDesktop ? "settings-modal-content-tablet" : ""} ${
							isMobile ? "settings-modal-content-mobile" : ""
						}`}
					>
						{(!settingsOptions || !isMobile) && (
							<Flex className="options-container" style={{ overflowY: "auto" }}>
								{!isMobile && (
									<Text
										className="bold"
										fontSize="1.23rem"
										lineHeight="1.85rem"
										padding={"1.23rem 0rem 1.23rem 1.23rem"}
									>
										{t("settings.text")}
									</Text>
								)}
								{renderOptionItems}
							</Flex>
						)}
						{!isMobile && <Divider orientation="vertical" className="col-divider" />}
						{!!settingsOptions && (
							<Flex data-testid="option-details-container" className="option-details-container">
								{renderOptionDetails}
							</Flex>
						)}
					</Flex>
					<Divider orientation="vertical" className="col-divider" />
				</>
			}
		/>
	);
};

export default SettingsModal;
