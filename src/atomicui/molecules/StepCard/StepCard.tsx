/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { memo, useCallback, useEffect, useState } from "react";

import { Flex, Text, View } from "@aws-amplify/ui-react";
import { IconDestination, IconSegment } from "@demo/assets";
import { useAmplifyMap, useAwsPlace } from "@demo/hooks";
import { MapUnitEnum, SuggestionType, TravelMode } from "@demo/types";
import { Position, Step } from "aws-sdk/clients/location";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const { METRIC } = MapUnitEnum;

interface StepCardProps {
	step: Step;
	isFirst: boolean;
	isLast: boolean;
	travelMode: TravelMode;
}

const StepCard: React.FC<StepCardProps> = ({ step, isFirst, isLast, travelMode }) => {
	const [placeData, setPlaceData] = useState<SuggestionType | undefined>(undefined);
	const { mapUnit: currentMapUnit } = useAmplifyMap();
	const { getPlaceDataByCoordinates } = useAwsPlace();
	const onlyOneEl = isFirst && isLast;
	const { t, i18n } = useTranslation();
	const currentLang = i18n.language;
	const isLanguageRTL = ["ar", "he"].includes(currentLang);

	const fetchPlaceData = useCallback(
		async (coords: Position) => {
			const pd = await getPlaceDataByCoordinates(coords);
			setPlaceData(pd?.Results[0]);
		},
		[getPlaceDataByCoordinates]
	);

	useEffect(() => {
		if (!placeData) {
			const [lng, lat] = !isLast ? step.StartPosition : step.EndPosition;
			fetchPlaceData([lng, lat]);
		}
	}, [placeData, isLast, step, fetchPlaceData]);

	return placeData ? (
		<View data-testid="step-card-container" className={isLast ? "step-card bottom-border-radius" : "step-card"}>
			{onlyOneEl ? (
				<View className="step-card-icon-container">
					<IconSegment data-testid="segment-icon" className="icon-segment" />
				</View>
			) : (
				<View className="step-card-icon-container">
					{!isFirst && (
						<View
							style={{ borderRight: `4px ${travelMode === TravelMode.WALKING ? "none" : "solid"} #008296` }}
							className="line-top"
						>
							{travelMode === TravelMode.WALKING &&
								[...Array(2)].map((_, index) => <View key={String(index)} className="circle" />)}
						</View>
					)}
					{!isLast ? (
						<IconSegment data-testid="segment-icon" className={isFirst ? "icon-segment" : ""} />
					) : (
						<IconDestination data-testid="destination-icon" />
					)}
					{!isLast && (
						<View
							style={{ borderRight: `4px ${travelMode === TravelMode.WALKING ? "none" : "solid"} #008296` }}
							className="line-bottom"
						>
							{travelMode === TravelMode.WALKING &&
								[...Array(2)].map((_, index) => <View key={String(index)} className="circle" />)}
						</View>
					)}
				</View>
			)}
			<View className="step-card-details">
				<Text className="address">
					{placeData.Place?.Label || `${(placeData.Place?.Geometry.Point?.[1], placeData.Place?.Geometry.Point?.[0])}`}
				</Text>
				<Flex
					gap="0.3rem"
					direction={isLanguageRTL ? "row-reverse" : "row"}
					justifyContent={isLanguageRTL ? "flex-end" : "flex-start"}
				>
					<Text className="distance">{step.Distance.toFixed(2)}</Text>
					<Text className="distance">
						{currentMapUnit === METRIC ? t("geofence_box__km__short.text") : t("geofence_box__mi__short.text")}
					</Text>
				</Flex>
			</View>
		</View>
	) : null;
};

export default memo(StepCard);
