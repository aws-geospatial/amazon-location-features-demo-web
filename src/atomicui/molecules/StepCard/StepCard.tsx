/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { memo, useCallback, useEffect, useState } from "react";

import { Text, View } from "@aws-amplify/ui-react";
import { IconDestination, IconSegment } from "@demo/assets";
import { useAmplifyMap, useAwsPlace } from "@demo/hooks";
import { DistanceUnitEnum, MapUnitEnum, SuggestionType, TravelMode } from "@demo/types";
import { Position, Step } from "aws-sdk/clients/location";
import "./styles.scss";

const { METRIC } = MapUnitEnum;
const { KILOMETERS_SHORT, MILES_SHORT } = DistanceUnitEnum;

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
				<Text>
					{placeData.Place?.Label || `${(placeData.Place?.Geometry.Point?.[1], placeData.Place?.Geometry.Point?.[0])}`}
				</Text>
				<Text>{`${step.Distance.toFixed(2)} ${currentMapUnit === METRIC ? KILOMETERS_SHORT : MILES_SHORT}`}</Text>
			</View>
		</View>
	) : null;
};

export default memo(StepCard);
