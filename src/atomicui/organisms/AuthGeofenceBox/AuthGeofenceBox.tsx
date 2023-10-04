/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button, Card, Flex, Loader, SelectField, SliderField, Text, View } from "@aws-amplify/ui-react";
import {
	IconBackArrow,
	IconClose,
	IconGeofenceMarker,
	IconGeofenceMarkerDisabled,
	IconPin,
	IconPlus,
	IconSearch,
	IconTrash
} from "@demo/assets";
import { GeofenceMarker, InputField, NotFoundCard } from "@demo/atomicui/molecules";
import { showToast } from "@demo/core";
import { appConfig } from "@demo/core/constants";
import { useAmplifyMap, useAwsGeofence, useAwsPlace, useMediaQuery } from "@demo/hooks";
import {
	CircleDrawEventType,
	DistanceUnitEnum,
	MapProviderEnum,
	MapUnitEnum,
	RadiusInM,
	SuggestionType,
	ToastType
} from "@demo/types";
import { AnalyticsEventActionsEnum, EventTypeEnum, TriggeredByEnum } from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import * as turf from "@turf/turf";
import { ListGeofenceResponseEntry, Place, Position } from "aws-sdk/clients/location";
import { useTranslation } from "react-i18next";
import { Layer, LngLat, MapRef, Source } from "react-map-gl";
import { Tooltip } from "react-tooltip";

import CircleDrawControl from "./CircleDrawControl";
import "./styles.scss";

const { IMPERIAL, METRIC } = MapUnitEnum;
const { MILES, MILES_SHORT, FEET, FEET_SHORT, KILOMETERS, KILOMETERS_SHORT, METERS, METERS_SHORT } = DistanceUnitEnum;
const {
	MAP_RESOURCES: { MAX_BOUNDS }
} = appConfig;

export interface AuthGeofenceBoxProps {
	mapRef: MapRef | null;
	setShowAuthGeofenceBox: (b: boolean) => void;
}

const AuthGeofenceBox: React.FC<AuthGeofenceBoxProps> = ({ mapRef, setShowAuthGeofenceBox }) => {
	const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [value, setValue] = useState("");
	const [name, setName] = useState("");
	const { mapUnit: currentMapUnit, mapProvider: currentMapProvider } = useAmplifyMap();
	const [unit, setUnit] = useState(currentMapUnit === METRIC ? METERS_SHORT : FEET_SHORT);
	/* Radius must be greater than 0 and not greater than 100,000 m (API requirement) */
	const [radiusInM, setRadiusInM] = useState(RadiusInM.DEFAULT);
	const [suggestions, setSuggestions] = useState<SuggestionType[] | undefined>(undefined);
	const [place, setPlace] = useState<Place | undefined>(undefined);
	const [geofenceCenter, setGeofenceCenter] = useState<Position | undefined>(undefined);
	const [current, setCurrent] = useState<{ value: string | undefined; radiusInM: number | undefined }>({
		value: undefined,
		radiusInM: undefined
	});
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const { search, getPlaceData } = useAwsPlace();
	const {
		getGeofencesList,
		isFetchingGeofences,
		geofences,
		createGeofence,
		deleteGeofence,
		isAddingGeofence,
		setIsAddingGeofence
	} = useAwsGeofence();
	const { t, i18n } = useTranslation();
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";

	const fetchGeofencesList = useCallback(async () => getGeofencesList(), [getGeofencesList]);

	useEffect(() => {
		fetchGeofencesList();
	}, [fetchGeofencesList]);

	const resetFormValues = useCallback(() => {
		setValue("");
		setSuggestions(undefined);
		setRadiusInM(RadiusInM.DEFAULT);
		setName("");
		setPlace(undefined);
		setGeofenceCenter(undefined);
	}, [setGeofenceCenter]);

	useEffect(() => {
		if (!value && place && geofenceCenter) resetFormValues();
	}, [value, place, geofenceCenter, resetFormValues]);

	const resetAll = useCallback(() => {
		resetFormValues();
		setIsEditing(false);
		setIsAddingGeofence(false);
	}, [resetFormValues, setIsAddingGeofence]);

	const onClose = () => {
		resetAll();
		setShowAuthGeofenceBox(false);
	};

	const handleSearch = useCallback(
		async (value: string, exact = false) => {
			if (value.length >= 3) {
				const { lng: longitude, lat: latitude } = mapRef?.getCenter() as LngLat;

				if (timeoutIdRef.current) {
					clearTimeout(timeoutIdRef.current);
				}

				timeoutIdRef.current = setTimeout(async () => {
					await search(
						value,
						{ longitude, latitude },
						exact,
						sg => setSuggestions(sg),
						TriggeredByEnum.GEOFENCE_MODULE,
						AnalyticsEventActionsEnum.AUTOCOMPLETE
					);
				}, 200);
			}
		},
		[mapRef, search]
	);

	useEffect(() => {
		return () => {
			if (timeoutIdRef.current) {
				clearTimeout(timeoutIdRef.current);
			}
		};
	}, []);

	const onChange = useCallback(
		async ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
			setValue(value);
			await handleSearch(value, false);
		},
		[handleSearch]
	);

	const onSearch = useCallback(async () => !!value && (await handleSearch(value)), [value, handleSearch]);

	const setCirclePropertiesFromSuggestion = (place: Place) => {
		setGeofenceCenter(place.Geometry.Point);
		setValue(place?.Label || "");
		setSuggestions(undefined);
	};

	const onSelectSuggestion = useCallback(
		async ({ PlaceId, Text = "", Place }: SuggestionType) => {
			if (!PlaceId && Text && !Place) {
				await handleSearch(Text, true);
			} else if (PlaceId && Text && !Place) {
				const pd = await getPlaceData(PlaceId);

				if (pd) {
					setPlace(pd.Place);
					setCirclePropertiesFromSuggestion(pd.Place);
				}
			} else if (!PlaceId && !Text && Place) {
				setPlace(Place);
				setCirclePropertiesFromSuggestion(Place);
			}
		},
		[handleSearch, getPlaceData]
	);

	const renderSuggestions = useMemo(() => {
		if (!!value && !!suggestions) {
			return suggestions?.length ? (
				suggestions.map(({ PlaceId, Text: text, Place }, idx) => {
					const string = text || Place?.Label || "";
					const separateIndex = !!PlaceId ? string?.indexOf(",") : -1;
					const title = separateIndex > -1 ? string?.substring(0, separateIndex) : string;
					const address = separateIndex > 1 ? string?.substring(separateIndex + 1) : null;

					return (
						<Flex
							key={`${PlaceId}-${idx}`}
							className={idx === 0 ? "suggestion border-top" : "suggestion"}
							onClick={() => onSelectSuggestion({ PlaceId, Text: text, Place })}
						>
							{PlaceId ? <IconPin /> : <IconSearch />}
							<Flex gap={0} direction="column" justifyContent="center" marginLeft="19px">
								<Text>{title}</Text>
								<Text variation="tertiary" textAlign={isLtr ? "start" : "end"}>
									{PlaceId && address ? address : t("search_nearby.text")}
								</Text>
							</Flex>
						</Flex>
					);
				})
			) : (
				<Flex className="geofence-box-suggestion">
					<NotFoundCard />
				</Flex>
			);
		}
	}, [value, suggestions, onSelectSuggestion, t, isLtr]);

	const onSave = useCallback(async () => {
		if (geofenceCenter) {
			await createGeofence(name, { Circle: { Center: geofenceCenter, Radius: radiusInM } });
			resetAll();
		}
	}, [geofenceCenter, createGeofence, name, radiusInM, resetAll]);

	const onChangeName = ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
		if (value.length <= 20) {
			setName(value.trim());
		}
	};

	const onChangeRadius = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const radius = Number(e.target.value);
			const lowerLimit =
				currentMapUnit === IMPERIAL
					? unit === MILES_SHORT
						? RadiusInM.MIN / 1609
						: RadiusInM.MIN / 3.281
					: unit === KILOMETERS_SHORT
					? RadiusInM.MIN / 1000
					: RadiusInM.MIN;
			const upperLimit =
				currentMapUnit === IMPERIAL
					? unit === MILES_SHORT
						? RadiusInM.MAX / 1609
						: RadiusInM.MAX / 3.281
					: unit === KILOMETERS_SHORT
					? RadiusInM.MAX / 1000
					: RadiusInM.MAX;

			if (!isNaN(radius) && radius >= lowerLimit && radius <= upperLimit) {
				setRadiusInM(
					currentMapUnit === IMPERIAL
						? unit === MILES_SHORT
							? parseFloat((radius * 1609).toFixed(2))
							: parseFloat((radius / 3.281).toFixed(2))
						: unit === KILOMETERS_SHORT
						? parseFloat((radius * 1000).toFixed(2))
						: parseInt(radius.toString())
				);
			}
		},
		[currentMapUnit, unit]
	);

	const renderAddGeofence = useMemo(() => {
		const validName =
			/^[A-Za-z\u0600-\u06FF\u0750-\u077F\u0590-\u05FF\u0900-\u097F_-][A-Za-z0-9\u0600-\u06FF\u0750-\u077F\u0590-\u05FF\u0900-\u097F_-]*$/.test(
				name
			);
		const nameExists = !!name && !!geofences?.find(({ GeofenceId }) => GeofenceId === name);
		const errorMsg =
			!!name && !isEditing
				? !validName
					? t("geofence_box__error_1.text")
					: nameExists
					? t("geofence_box__error_2.text")
					: ""
				: "";
		const isSaveDisabled = isEditing ? current.value === value && current.radiusInM === radiusInM : !name || !!errorMsg;

		return (
			<Flex data-testid="auth-geofence-add-container" gap={0} direction="column" padding={"0px 16px"}>
				{!geofenceCenter && (
					<Flex gap={0} justifyContent="center" alignItems="center" marginTop="14px">
						<Flex className="icon-plus-rounded">
							<IconPlus />
						</Flex>
						<Text
							variation="tertiary"
							margin={isLtr ? "0rem 0rem 0rem 1.23rem" : "0rem 1.23rem 0rem 0rem"}
							textAlign={isLtr ? "start" : "end"}
						>
							{t("geofence_box__click_any_point.text")}
						</Text>
					</Flex>
				)}
				<InputField
					dataTestId="auth-geofence-box-search-input"
					containerMargin="16px 0px 24px 0px"
					placeholder={t("geofence_box__search_placeholder.text") as string}
					value={value}
					onChange={onChange}
					innerEndComponent={
						<Flex className="icon-search-container" onClick={onSearch}>
							<IconSearch />
						</Flex>
					}
					dir={langDir}
				/>
				<View maxHeight="50vh" overflow="scroll">
					{renderSuggestions}
				</View>
				{!suggestions?.length && geofenceCenter && (
					<>
						<InputField
							dataTestId="auth-geofence-box-name-field"
							containerMargin={errorMsg ? "0px 0px 8px 0px" : "0px 0px 24px 0px"}
							label={t("geofence_box__name.text") as string}
							placeholder={t("geofence_box__name_placeholder.text") as string}
							value={name}
							onChange={onChangeName}
							disabled={isEditing}
							dir={langDir}
						/>
						{!!errorMsg && (
							<Text
								style={{ color: "var(--red-color)" }}
								fontFamily="AmazonEmber-Medium"
								fontSize="12px"
								marginBottom="24px"
								textAlign={isLtr ? "start" : "end"}
							>
								{errorMsg}
							</Text>
						)}
						<Flex gap={0} direction="column" marginBottom="1.85rem">
							<SliderField
								data-testid="geofence-radius-slider"
								className="geofence-radius-slider"
								width="100%"
								margin="0rem 1.23rem 0.62rem 0rem"
								label={t("geofence_box__radius.text")}
								fontFamily="AmazonEmber-Bold"
								fontSize="1rem"
								lineHeight="1.38rem"
								alignItems={isLtr ? "start" : "end"}
								isValueHidden
								min={RadiusInM.MIN}
								max={RadiusInM.MAX}
								value={radiusInM}
								onChange={radiusInM => setRadiusInM(radiusInM)}
							/>
							<Flex gap={0}>
								<View className="radius-input-container">
									<InputField
										label=""
										type="number"
										value={
											currentMapUnit === IMPERIAL
												? unit === MILES_SHORT
													? (radiusInM / 1609).toFixed(2)
													: (radiusInM * 3.281).toFixed(2)
												: unit === KILOMETERS_SHORT
												? (radiusInM / 1000).toFixed(2)
												: parseInt(radiusInM.toString()).toString()
										}
										onChange={e => onChangeRadius(e)}
									/>
								</View>
								<SelectField
									className="unit-select-field"
									textAlign={isLtr ? "start" : "end"}
									flex={1}
									fontFamily="AmazonEmber-Regular"
									fontSize="1rem"
									lineHeight="1.38rem"
									label=""
									labelHidden
									value={
										currentMapUnit === IMPERIAL
											? unit === MILES_SHORT
												? MILES
												: FEET
											: unit === KILOMETERS_SHORT
											? KILOMETERS
											: METERS
									}
									onChange={e => {
										currentMapUnit === IMPERIAL
											? setUnit(e.target.value === MILES ? MILES_SHORT : FEET_SHORT)
											: setUnit(e.target.value === KILOMETERS ? KILOMETERS_SHORT : METERS_SHORT);
									}}
								>
									{currentMapUnit === IMPERIAL ? (
										<>
											<option value={MILES}>{t("geofence_box__mi.text")}</option>
											<option value={FEET}>{t("geofence_box__ft.text")}</option>
										</>
									) : (
										<>
											<option value={KILOMETERS}>{t("geofence_box__km.text")}</option>
											<option value={METERS}>{t("geofence_box__m.text")}</option>
										</>
									)}
								</SelectField>
							</Flex>
						</Flex>
						<Button
							variation="primary"
							fontFamily="AmazonEmber-Bold"
							fontSize="13px"
							lineHeight="18px"
							disabled={isSaveDisabled}
							onClick={onSave}
						>
							{t("save.text")}
						</Button>
					</>
				)}
				{isAddingGeofence && (
					<Button
						marginBottom="8px"
						margin="8px 0px 24px 0px"
						fontFamily="AmazonEmber-Bold"
						fontSize="13px"
						lineHeight="18px"
						onClick={resetAll}
					>
						{t("geofence_box__go_back.text")}
					</Button>
				)}
			</Flex>
		);
	}, [
		isAddingGeofence,
		resetAll,
		geofences,
		geofenceCenter,
		value,
		onChange,
		onSearch,
		renderSuggestions,
		suggestions,
		radiusInM,
		name,
		onSave,
		isEditing,
		unit,
		onChangeRadius,
		current,
		currentMapUnit,
		t,
		langDir,
		isLtr
	]);

	const onDelete = useCallback(
		async (e: React.MouseEvent<HTMLDivElement, MouseEvent>, GeofenceId: string) => {
			e.stopPropagation();
			await deleteGeofence(GeofenceId);
		},
		[deleteGeofence]
	);

	const onClickGeofenceItem = useCallback(
		(GeofenceId: string, Center: Position, Radius: number) => {
			setValue(`${Center[1]}, ${Center[0]}`);
			setName(GeofenceId);
			setGeofenceCenter(Center);
			setRadiusInM(Radius);
			setCurrent({ value: `${Center[1]}, ${Center[0]}`, radiusInM: Radius });
			setIsAddingGeofence(true);
			setIsEditing(true);

			record(
				[{ EventType: EventTypeEnum.GEOFENCE_ITEM_SELECTED, Attributes: { geofenceId: GeofenceId } }],
				["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
			);
		},
		[setIsAddingGeofence]
	);

	const renderGeofenceListItem = useCallback(
		({ GeofenceId, Geometry: { Circle } }: ListGeofenceResponseEntry, idx: number) => {
			if (Circle) {
				const { Center, Radius } = Circle;
				const [westBound, southBound, eastBound, northBound] = MAX_BOUNDS.GRAB;
				const isWithinGrabBounds =
					Center[1] >= southBound && Center[1] <= northBound && Center[0] >= westBound && Center[0] <= eastBound;
				const isDisabled = currentMapProvider === MapProviderEnum.GRAB && !isWithinGrabBounds;
				const circle = turf.circle(Center, Radius, { steps: 50, units: "meters" });
				const line = turf.lineString(circle.geometry.coordinates[0]);

				return (
					<Flex
						data-testid={GeofenceId}
						key={idx}
						className={idx !== geofences!.length - 1 ? "geofence-item border-bottom" : "geofence-item"}
						style={isDisabled ? { opacity: 0.3 } : {}}
						gap={0}
						padding="10px 0px 10px 10px"
						alignItems="center"
						onClick={isDisabled ? () => {} : () => onClickGeofenceItem(GeofenceId, Center, Radius)}
						data-tooltip-id="geofence-item"
						data-tooltip-place="right"
						data-tooltip-position-strategy="fixed"
						data-tooltip-content={isDisabled ? t("tooltip__disabled_geofence.text") : ""}
					>
						<Tooltip id="geofence-item" />
						{isDisabled ? <IconGeofenceMarkerDisabled style={{ margin: "0rem 0.5rem" }} /> : <IconGeofenceMarker />}
						<Flex gap={0} direction="column">
							<Text>{GeofenceId}</Text>
						</Flex>
						<div
							data-testid={`icon-trash-${GeofenceId}`}
							className={isDisabled ? "icon-trash-container-diabled" : "icon-trash-container"}
							onClick={isDisabled ? () => {} : e => onDelete(e, GeofenceId)}
						>
							<IconTrash />
						</div>
						{!isDisabled && (
							<div key={GeofenceId}>
								<Source id={`${GeofenceId}-circle-source-fill`} type="geojson" data={circle}>
									<Layer
										id={`${GeofenceId}-circle-layer-fill`}
										type="fill"
										paint={{
											"fill-opacity": 0.4,
											"fill-color": "#30b8c0"
										}}
									/>
								</Source>
								<Source id={`${GeofenceId}-circle-source-line`} type="geojson" data={line}>
									<Layer
										id={`${GeofenceId}-circle-layer-line`}
										type="line"
										layout={{ "line-cap": "round", "line-join": "round" }}
										paint={{
											"line-color": "#008296",
											"line-width": 2
										}}
									/>
								</Source>
							</div>
						)}
					</Flex>
				);
			}
		},
		[geofences, onClickGeofenceItem, currentMapProvider, onDelete, t]
	);

	const renderGeofencesList = useMemo(() => {
		if (isFetchingGeofences) {
			return (
				<Flex
					data-testid="auth-geofence-box-loader"
					gap={0}
					padding="24px 0px"
					direction="column"
					justifyContent="center"
					alignItems="center"
				>
					<Loader width="40px" height="40px" />
					<Text className="bold" marginTop="16px" variation="tertiary">
						{t("geofence_box__fetching_geofences.text")}
					</Text>
				</Flex>
			);
		} else {
			if (geofences?.length) {
				return geofences.map((geofence, idx) => renderGeofenceListItem(geofence, idx));
			} else {
				return (
					<Flex
						data-testid="auth-geofence-box-empty-list"
						gap={0}
						direction="column"
						justifyContent="center"
						alignItems="center"
						padding="24px 24px"
					>
						<Text textAlign={isLtr ? "start" : "end"}>{t("geofence_box__havent_created.text")}</Text>
						<Text variation="tertiary" textAlign={isLtr ? "start" : "end"}>
							{t("geofence_box__add_to_view.text")}
						</Text>
					</Flex>
				);
			}
		}
	}, [isFetchingGeofences, geofences, renderGeofenceListItem, t, isLtr]);

	const isAddingOrEditing = useMemo(() => isAddingGeofence || isEditing, [isAddingGeofence, isEditing]);

	const renderGeofenceMarkers = useMemo(() => {
		if (geofences?.length) {
			return geofences.map(({ GeofenceId, Geometry: { Circle } }, idx) => {
				if (Circle) {
					const { Center, Radius } = Circle;

					if (isEditing && name === GeofenceId) return null;

					return (
						<GeofenceMarker
							key={idx}
							lng={Center[0]}
							lat={Center[1]}
							description={GeofenceId}
							showPointer={true}
							onClick={() => onClickGeofenceItem(GeofenceId, Center, Radius)}
						/>
					);
				}
			});
		}
	}, [geofences, isEditing, name, onClickGeofenceItem]);

	const renderCircleGeofenceMarker = useMemo(() => {
		if (isAddingGeofence && geofenceCenter) {
			return <GeofenceMarker lng={geofenceCenter[0]} lat={geofenceCenter[1]} description={name} />;
		}
	}, [isAddingGeofence, geofenceCenter, name]);

	const setCirclePropertiesFromDrawControl = (e: CircleDrawEventType) => {
		const { features } = e;
		const {
			properties: { center, radiusInKm }
		} = features[0];
		setValue(`${center[1]}, ${center[0]}`);
		setGeofenceCenter(center);
		setRadiusInM(
			radiusInKm === 2
				? parseInt(radiusInM.toString())
				: radiusInKm > RadiusInM.MAX / 1000
				? RadiusInM.MAX
				: parseInt((radiusInKm * 1000).toString())
		);
		radiusInKm > RadiusInM.MAX / 1000 &&
			showToast({ content: t("show_toast__radius_restriction.text"), type: ToastType.INFO });
	};

	return (
		<>
			<Card data-testid="auth-geofence-box-card" className="geofence-card" left={21}>
				<Flex className="geofence-card-header">
					<Flex alignItems={"center"}>
						{isAddingOrEditing && <IconBackArrow className="back-icon" onClick={resetAll} />}
						<Text fontFamily="AmazonEmber-Medium" fontSize="1.08rem" textAlign={isLtr ? "start" : "end"}>
							{isAddingGeofence
								? isEditing
									? t("geofence_box__edit_geofence.text")
									: t("geofence_box__add_geofence.text")
								: t("geofence.text")}
						</Text>
					</Flex>
					<Flex gap={0} alignItems="center">
						{!isAddingGeofence && (
							<Flex
								data-testid="auth-geofence-box-add-button"
								className="geofence-action"
								onClick={() => {
									setIsAddingGeofence(true);
									record(
										[
											{
												EventType: EventTypeEnum.GEOFENCE_CREATION_STARTED,
												Attributes: { triggeredBy: TriggeredByEnum.GEOFENCE_MODULE }
											}
										],
										["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
									);
								}}
							>
								<IconPlus />
								<Text className="bold" textAlign={isLtr ? "start" : "end"}>
									{t("geofence_box__add.text")}
								</Text>
							</Flex>
						)}
						{!isAddingOrEditing && (
							<Flex className="geofence-card-close" onClick={onClose}>
								<IconClose />
							</Flex>
						)}
					</Flex>
				</Flex>
				{isAddingGeofence ? (
					renderAddGeofence
				) : (
					<View data-testid="geofences-list-container" className="geofences-list-container">
						{renderGeofencesList}
					</View>
				)}
			</Card>
			{renderGeofenceMarkers}
			{renderCircleGeofenceMarker}
			{isAddingGeofence && (
				<CircleDrawControl
					geofenceCenter={geofenceCenter}
					radiusInM={radiusInM}
					onCreate={e => setCirclePropertiesFromDrawControl(e)}
					onUpdate={e => setCirclePropertiesFromDrawControl(e)}
					isDesktop={isDesktop}
				/>
			)}
		</>
	);
};

export default AuthGeofenceBox;
