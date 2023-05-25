/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Button, Card, Flex, Loader, SelectField, SliderField, Text, View } from "@aws-amplify/ui-react";
import {
	IconArrow,
	IconBackArrow,
	IconClose,
	IconGeofenceMarker,
	IconPin,
	IconPlus,
	IconSearch,
	IconTrash
} from "@demo/assets";
import { TextEl } from "@demo/atomicui/atoms";
import { GeofenceMarker, InputField, NotFoundCard } from "@demo/atomicui/molecules";
import { showToast } from "@demo/core";
import { useAmplifyMap, useAwsGeofence, useAwsPlace, useMediaQuery } from "@demo/hooks";
import { CircleDrawEventType, DistanceUnitEnum, MapUnitEnum, RadiusInM, SuggestionType, ToastType } from "@demo/types";
import { ListGeofenceResponseEntry, Place, Position } from "aws-sdk/clients/location";
import { LngLat, MapRef } from "react-map-gl";

import CircleDrawControl from "./CircleDrawControl";

import "./styles.scss";

const { IMPERIAL, METRIC } = MapUnitEnum;
const { MILES, MILES_SHORT, FEET, FEET_SHORT, KILOMETERS, KILOMETERS_SHORT, METERS, METERS_SHORT } = DistanceUnitEnum;

interface GeofenceBoxProps {
	mapRef: MapRef | null;
	setShowGeofenceBox: (b: boolean) => void;
}

const GeofenceBox: React.FC<GeofenceBoxProps> = ({ mapRef, setShowGeofenceBox }) => {
	const [isEditing, setIsEditing] = useState(false);
	const [value, setValue] = useState("");
	const [name, setName] = useState("");
	const { mapUnit: currentMapUnit } = useAmplifyMap();
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
	const [isCollapsed, setIsCollapsed] = useState(true);
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

	useEffect(() => {
		isDesktop && isCollapsed && setIsCollapsed(false);
	}, [isDesktop, isCollapsed]);

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
		setShowGeofenceBox(false);
	};

	const handleSearch = useCallback(
		async (value: string, exact = false) => {
			if (value.length >= 3) {
				const { lng: longitude, lat: latitude } = mapRef?.getCenter() as LngLat;
				await search(value, { longitude, latitude }, exact, sg => setSuggestions(sg));
			}
		},
		[mapRef, search]
	);

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
				suggestions.map(({ PlaceId, Text = "", Place }, idx) => {
					const string = Text || Place?.Label || "";
					const separateIndex = !!PlaceId ? string?.indexOf(",") : -1;
					const title = separateIndex > -1 ? string?.substring(0, separateIndex) : string;
					const address = separateIndex > 1 ? string?.substring(separateIndex + 1) : null;

					return (
						<Flex
							key={`${PlaceId}-${idx}`}
							className={idx === 0 ? "suggestion border-top" : "suggestion"}
							onClick={() => onSelectSuggestion({ PlaceId, Text, Place })}
						>
							{PlaceId ? <IconPin /> : <IconSearch />}
							<Flex gap={0} direction="column" justifyContent="center" marginLeft="19px">
								<TextEl text={title} />
								<TextEl variation="tertiary" text={PlaceId && address ? address : "Search nearby"} />
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
	}, [value, suggestions, onSelectSuggestion]);

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
		const validName = /^[A-Za-z_-][A-Za-z0-9_-]*$/.test(name);
		const nameExists = !!name && !!geofences?.find(({ GeofenceId }) => GeofenceId === name);
		const errorMsg =
			!!name && !isEditing
				? !validName
					? "Name can only contain alphanumeric, underscore and hyphen characters"
					: nameExists
					? "Name already exists, please enter a unique name"
					: ""
				: "";
		const isSaveDisabled = isEditing ? current.value === value && current.radiusInM === radiusInM : !name || !!errorMsg;

		return (
			<Flex gap={0} direction="column" padding={"0px 16px"}>
				{!geofenceCenter && (
					<Flex gap={0} justifyContent="center" alignItems="center" marginTop="14px">
						<Flex className="icon-plus-rounded">
							<IconPlus />
						</Flex>
						<TextEl
							marginLeft="16px"
							variation="tertiary"
							text="Click on any point on the map or enter the address/coordinate to create a geofence marker"
						/>
					</Flex>
				)}
				<InputField
					containerMargin="16px 0px 24px 0px"
					placeholder="Enter address or coordinates"
					value={value}
					onChange={onChange}
					innerEndComponent={
						<Flex className="icon-search-container" onClick={onSearch}>
							<IconSearch />
						</Flex>
					}
				/>
				<View maxHeight="50vh" overflow="scroll">
					{renderSuggestions}
				</View>
				{!suggestions?.length && geofenceCenter && (
					<>
						<InputField
							containerMargin={errorMsg ? "0px 0px 8px 0px" : "0px 0px 24px 0px"}
							label="Name"
							placeholder="Type unique Geofence Name"
							value={name}
							onChange={onChangeName}
							disabled={isEditing}
						/>
						{!!errorMsg && (
							<TextEl
								style={{ color: "var(--red-color)" }}
								fontFamily="AmazonEmber-Medium"
								fontSize="12px"
								marginBottom="24px"
								text={errorMsg}
							/>
						)}
						{!isCollapsed && (
							<>
								<Flex gap={0} direction="column" marginBottom="1.85rem">
									<SliderField
										className="geofence-radius-slider"
										width="100%"
										margin="0rem 1.23rem 0.62rem 0rem"
										label="Radius"
										fontFamily="AmazonEmber-Bold"
										fontSize="1rem"
										lineHeight="1.38rem"
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
													<option value={MILES}>{MILES}</option>
													<option value={FEET}>{FEET}</option>
												</>
											) : (
												<>
													<option value={KILOMETERS}>{KILOMETERS}</option>
													<option value={METERS}>{METERS}</option>
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
									Save
								</Button>
							</>
						)}
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
						Go Back
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
		isCollapsed
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
		},
		[setIsAddingGeofence]
	);

	const renderGeofenceListItem = useCallback(
		({ GeofenceId, Geometry: { Circle } }: ListGeofenceResponseEntry, idx: number) => {
			if (Circle) {
				const { Center, Radius } = Circle;

				return (
					<Flex
						key={idx}
						className={idx !== geofences!.length - 1 ? "geofence-item border-bottom" : "geofence-item"}
						gap={0}
						padding="10px 0px 10px 10px"
						alignItems="center"
						onClick={() => onClickGeofenceItem(GeofenceId, Center, Radius)}
					>
						<IconGeofenceMarker />
						<Flex gap={0} direction="column">
							<TextEl text={GeofenceId} />
						</Flex>
						<div
							data-testid={`icon-trash-${GeofenceId}`}
							className="icon-trash-container"
							onClick={e => onDelete(e, GeofenceId)}
						>
							<IconTrash />
						</div>
					</Flex>
				);
			}
		},
		[geofences, onClickGeofenceItem, onDelete]
	);

	const renderGeofencesList = useMemo(() => {
		if (isFetchingGeofences) {
			return (
				<Flex gap={0} padding="24px 0px" direction="column" justifyContent="center" alignItems="center">
					<Loader width="40px" height="40px" />
					<TextEl marginTop="16px" variation="tertiary" fontFamily="AmazonEmber-Bold" text="fetching geofences..." />
				</Flex>
			);
		} else {
			if (geofences?.length) {
				return isCollapsed
					? geofences.slice(0, 3).map((geofence, idx) => renderGeofenceListItem(geofence, idx))
					: geofences.map((geofence, idx) => renderGeofenceListItem(geofence, idx));
			} else {
				return (
					<Flex gap={0} direction="column" justifyContent="center" alignItems="center" padding="24px 24px">
						<TextEl text="You haven't created any geofences" />
						<TextEl variation="tertiary" text="Add a geofence to view it here!" />
					</Flex>
				);
			}
		}
	}, [isFetchingGeofences, geofences, renderGeofenceListItem, isCollapsed]);

	const isAddingOrEditing = useMemo(() => isAddingGeofence || isEditing, [isAddingGeofence, isEditing]);

	const renderShowHideContainer = useMemo(() => {
		if (!isAddingOrEditing && geofences && geofences.length > 3) {
			return (
				<Flex className="show-hide-details-container" onClick={() => setIsCollapsed(s => !s)}>
					<Text className="text">{isCollapsed ? "Geofence details" : "Hide details"}</Text>
					<IconArrow style={{ transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)" }} />
				</Flex>
			);
		}

		if ((isAddingGeofence && !!geofenceCenter) || isEditing) {
			return (
				<Flex className="show-hide-details-container" onClick={() => setIsCollapsed(s => !s)}>
					<Text className="text">{isCollapsed ? "Geofence details" : "Hide details"}</Text>
					<IconArrow style={{ transform: isCollapsed ? "rotate(0deg)" : "rotate(180deg)" }} />
				</Flex>
			);
		}
	}, [isAddingOrEditing, geofences, isAddingGeofence, geofenceCenter, isEditing, isCollapsed]);

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
			showToast({ content: "Radius can't be greater than 10 KM", type: ToastType.INFO });
	};

	return (
		<>
			<Card className="geofence-card" left={21}>
				<Flex className="geofence-card-header">
					<Flex alignItems={"center"}>
						{isAddingOrEditing && <IconBackArrow className="back-icon" onClick={resetAll} />}

						<TextEl
							fontFamily="AmazonEmber-Medium"
							fontSize="1.08rem"
							text={isAddingGeofence ? (isEditing ? "Edit Geofence" : "Add Geofence") : "Geofence"}
						/>
					</Flex>
					<Flex gap={0} alignItems="center">
						{!isAddingGeofence && (
							<Flex className="geofence-action" onClick={() => setIsAddingGeofence(true)}>
								<IconPlus />
								<TextEl fontFamily="AmazonEmber-Bold" text="Add" />
							</Flex>
						)}
						{!isAddingOrEditing && (
							<Flex className="geofence-card-close" onClick={onClose}>
								<IconClose />
							</Flex>
						)}
					</Flex>
				</Flex>
				{isAddingGeofence ? renderAddGeofence : <View className="geofences-list-container">{renderGeofencesList}</View>}
				{renderShowHideContainer}
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

export default GeofenceBox;
