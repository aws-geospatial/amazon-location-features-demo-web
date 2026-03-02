/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, lazy, useCallback, useMemo } from "react";

import { CheckboxField, Divider, Flex, Radio, Text } from "@aws-amplify/ui-react";
import {
	IconArrow,
	IconBackArrow,
	IconGlobe,
	IconLanguage,
	IconPaintroller,
	IconPeopleArrows,
	IconShuffle
} from "@demo/assets/svgs";
import { appConfig, languageSwitcherData } from "@demo/core/constants";
import { useAuth, useClient, useMap, usePersistedData } from "@demo/hooks";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import { MapUnitEnum, RegionEnum, SettingOptionEnum, SettingOptionItemType } from "@demo/types";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const Modal = lazy(() => import("@demo/atomicui/atoms/Modal").then(module => ({ default: module.Modal })));

const {
	API_KEYS,
	PERSIST_STORAGE_KEYS: { FASTEST_REGION }
} = appConfig;
const { IMPERIAL, METRIC } = MapUnitEnum;
const fallbackRegion = Object.keys(API_KEYS)[0];

interface SettingsModalProps {
	open: boolean;
	onClose: () => void;
	resetAppState: () => void;
	mapButtons: JSX.Element;
}

const SettingsModal: FC<SettingsModalProps> = ({ open, onClose, resetAppState, mapButtons }) => {
	const { autoRegion, setRegion, baseValues } = useAuth();
	const {
		autoMapUnit,
		setIsAutomaticMapUnit,
		mapUnit: currentMapUnit,
		setMapUnit,
		resetStore: resetMapStore,
		mapStyle
	} = useMap();
	const { defaultRouteOptions, setDefaultRouteOptions, setSettingsOptions, settingsOptions } = usePersistedData();
	const { resetStore: resetClientStore } = useClient();
	const { t, i18n } = useTranslation();
	const langDir = i18n.dir();
	const fastestRegion = localStorage.getItem(FASTEST_REGION) ?? fallbackRegion;
	const { isDesktop, isMobile } = useDeviceMediaQuery();

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

	const handleLanguageChange = useCallback(
		(e: { target: { value: string } }) => {
			i18n.changeLanguage(e.target.value);
		},
		[i18n]
	);

	const handleRouteOptionChange = useCallback(
		(e: { target: { checked: boolean } }, routeOption: string) => {
			setDefaultRouteOptions({ ...defaultRouteOptions, [routeOption]: e.target.checked });
		},
		[defaultRouteOptions, setDefaultRouteOptions]
	);

	const handleRegionChange = useCallback(
		(region: "Automatic" | RegionEnum) => {
			setRegion(region === "Automatic", region);
			resetClientStore();
			resetAppState();
			resetMapStore();
		},
		[setRegion, resetClientStore, resetAppState, resetMapStore]
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
						gap="0"
						direction="column"
						padding="0rem 1.15rem"
					>
						<Flex style={{ gap: 0, padding: "1.08rem 0rem", cursor: "pointer" }}>
							<Radio
								data-testid="unit-automatic-radio"
								value={"Automatic"}
								checked={autoMapUnit.selected}
								onChange={handleAutoMapUnitChange}
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
				id: SettingOptionEnum.MAP_STYLE,
				title: t("map_style.text"),
				defaultValue: mapStyle,
				icon: <IconPaintroller />,
				detailsComponent: (
					<Flex
						data-testid={`${SettingOptionEnum.MAP_STYLE}-details-component`}
						gap="0"
						direction="column"
						padding="1.08rem 0 0 0"
						overflow="hidden scroll"
						height="100%"
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
						gap="0"
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
						gap="0"
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
						/>
						<CheckboxField
							data-testid="avoid-ferries"
							className="sm-checkbox"
							label={t("avoid_ferries.text")}
							name={t("avoid_ferries.text")}
							value="Avoid ferries"
							checked={defaultRouteOptions.avoidFerries}
							onChange={e => handleRouteOptionChange(e, "avoidFerries")}
						/>
						<CheckboxField
							className="sm-checkbox"
							label={t("avoid_dirtroads.text")}
							name={t("avoid_dirtroads.text")}
							value="Avoid Dirtroads"
							checked={defaultRouteOptions.avoidDirtRoads}
							onChange={e => handleRouteOptionChange(e, "avoidDirtRoads")}
						/>
						<CheckboxField
							className="sm-checkbox"
							label={t("avoid_uturns.text")}
							name={t("avoid_uturns.text")}
							value="Avoid Uturns"
							checked={defaultRouteOptions.avoidUTurns}
							onChange={e => handleRouteOptionChange(e, "avoidUTurns")}
						/>
						<CheckboxField
							className="sm-checkbox"
							label={t("avoid_tunnels.text")}
							name={t("avoid_tunnels.text")}
							value="Avoid Tunnels"
							checked={defaultRouteOptions.avoidTunnels}
							onChange={e => handleRouteOptionChange(e, "avoidTunnels")}
						/>
					</Flex>
				)
			},
			{
				id: SettingOptionEnum.REGION,
				title: t("settings_modal__region.text"),
				defaultValue: autoRegion
					? (t("settings_modal__automatic.text") as string)
					: baseValues?.region === RegionEnum.EU_WEST_1
					? t("regions__eu_west__region.text")
					: baseValues?.region === RegionEnum.AP_SOUTHEAST_1
					? t("regions__ap_southeast__region.text")
					: t("regions__us_east__region.text"),
				icon: <IconGlobe />,
				detailsComponent: (
					<Flex
						data-testid={`${SettingOptionEnum.REGION}-details-component`}
						gap="0"
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
							>
								<Text marginLeft="1.23rem">{`${t("settings_modal__automatic.text")} - ${fastestRegion}`}</Text>
							</Radio>
						</Flex>
						<Flex style={{ gap: 0, padding: "1.08rem 0rem", cursor: "pointer" }}>
							<Radio
								data-testid={`region-${RegionEnum.US_EAST_1}-radio`}
								value={RegionEnum.US_EAST_1}
								checked={!autoRegion && baseValues?.region === RegionEnum.US_EAST_1}
								onChange={() => handleRegionChange(RegionEnum.US_EAST_1)}
							>
								<Text marginLeft="1.23rem">{t("regions__us_east_1.text")}</Text>
							</Radio>
						</Flex>
						<Flex style={{ gap: 0, padding: "1.08rem 0rem", cursor: "pointer" }}>
							<Radio
								data-testid={`region-${RegionEnum.EU_WEST_1}-radio`}
								value={RegionEnum.EU_WEST_1}
								checked={!autoRegion && baseValues?.region === RegionEnum.EU_WEST_1}
								onChange={() => handleRegionChange(RegionEnum.EU_WEST_1)}
							>
								<Text marginLeft="1.23rem">{t("regions__eu_west_1.text")}</Text>
							</Radio>
						</Flex>
						<p style={{ color: "var(--grey-color)" }} className="bold small-text">
							{t("multiple_region_disclaimer.text")}
						</p>
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
			mapStyle,
			mapButtons,
			defaultRouteOptions.avoidTolls,
			defaultRouteOptions.avoidFerries,
			defaultRouteOptions.avoidDirtRoads,
			defaultRouteOptions.avoidUTurns,
			defaultRouteOptions.avoidTunnels,
			autoRegion,
			baseValues?.region,
			langDir,
			fastestRegion,
			onMapUnitChange,
			i18n.language,
			handleLanguageChange,
			handleRouteOptionChange,
			handleRegionChange
		]
	);

	const renderOptionItems = useMemo(() => {
		return optionItems.map(({ id, title, defaultValue, icon }) => (
			<Flex
				data-testid={`option-item-${id}`}
				key={id}
				className={`option-item ${!isMobile && settingsOptions === id ? "selected" : ""} ${
					isMobile ? "option-item-mobile" : ""
				}`}
				onClick={() => setSettingsOptions(id)}
			>
				<Flex gap="0" alignItems="center">
					{icon}
					<Flex gap="0" direction="column">
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
	}, [optionItems, settingsOptions, isMobile, setSettingsOptions]);

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
		!isDesktop && window.location.reload();
	}, [isMobile, setSettingsOptions, onClose, isDesktop]);

	return (
		<Modal
			data-testid="settings-modal"
			open={open}
			onClose={modalCloseHandler}
			className={`settings-modal ${isMobile ? "settings-modal-mobile" : ""} ${
				!isDesktop ? "settings-modal-tablet" : ""
			} `}
		>
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
								<Text className="bold" fontSize="1.23rem" lineHeight="1.85rem" padding={"1.23rem 0rem 1.23rem 1.23rem"}>
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
		</Modal>
	);
};

export default SettingsModal;
