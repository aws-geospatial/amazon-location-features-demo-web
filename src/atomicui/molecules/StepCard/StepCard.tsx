/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { memo, useCallback, useEffect, useState } from "react";

import { Text, View } from "@aws-amplify/ui-react";
import { IconDestination, IconSegment } from "@demo/assets";
import { useAwsPlace } from "@demo/hooks";
import { SuggestionType, TravelMode } from "@demo/types";
import { Position, Step } from "aws-sdk/clients/location";
import "./styles.scss";

interface StepCardProps {
	step: Step;
	isFirst: boolean;
	isLast: boolean;
	travelMode: TravelMode;
}

const StepCard: React.FC<StepCardProps> = ({ step, isFirst, isLast, travelMode }) => {
	const [placeData, setPlaceData] = useState<SuggestionType | undefined>(undefined);
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
		<View className={isLast ? "step-card bottom-border-radius" : "step-card"}>
			{onlyOneEl ? (
				<View className="step-card-icon-container">
					<IconSegment className="icon-segment" />
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
					{!isLast ? <IconSegment className={isFirst ? "icon-segment" : ""} /> : <IconDestination />}
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
				<Text>{`${step.Distance.toFixed(2)} km`}</Text>
			</View>
		</View>
	) : null;
};

export default memo(StepCard);
