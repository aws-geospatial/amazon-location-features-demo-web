/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, memo, useCallback, useEffect, useRef, useState } from "react";

import { Flex, Text, View } from "@aws-amplify/ui-react";
import { Step } from "@aws-sdk/client-location";
import { useMap, usePlace } from "@demo/hooks";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import { MapUnitEnum, SuggestionType, TravelMode } from "@demo/types";
import { uuid } from "@demo/utils/uuid";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const { METRIC } = MapUnitEnum;

interface StepCardProps {
	step: Step;
	isFirst: boolean;
	isLast: boolean;
	travelMode: TravelMode;
}

const StepCard: FC<StepCardProps> = ({ step, isFirst, isLast }) => {
	const [placeData, setPlaceData] = useState<SuggestionType | undefined>(undefined);
	const { mapUnit: currentMapUnit } = useMap();
	const { getPlaceDataByCoordinates } = usePlace();
	const onlyOneEl = isFirst && isLast;
	const { t, i18n } = useTranslation();
	const { isDesktop } = useDeviceMediaQuery();
	const currentLang = i18n.language;
	const isLanguageRTL = ["ar", "he"].includes(currentLang);
	const stepCardRef = useRef<HTMLDivElement>(null);

	const fetchPlaceData = useCallback(
		async (coords: number[]) => {
			const pd = await getPlaceDataByCoordinates(coords);
			setPlaceData({ ...pd?.Results![0], Id: uuid.randomUUID() });
		},
		[getPlaceDataByCoordinates]
	);

	useEffect(() => {
		if (!placeData) {
			const [lng, lat] = !isLast ? (step.StartPosition as number[]) : (step.EndPosition as number[]);
			fetchPlaceData([lng, lat]);
		}
	}, [placeData, isLast, step, fetchPlaceData]);

	return placeData ? (
		<View
			data-testid="step-card-container"
			className={`step-card ${onlyOneEl ? "onlyOneEl" : ""} ${isLast ? "bottom-border-radius isLast" : ""} ${
				isFirst ? "isFirst" : ""
			}`}
		>
			<View className={`step-card-details ${!isDesktop ? "step-card-details-mobile" : ""}`}>
				<Text className="address" ref={stepCardRef}>
					{placeData.Place?.Label ||
						`${(placeData.Place?.Geometry?.Point?.[1], placeData.Place?.Geometry?.Point?.[0])}`}
				</Text>
				<Flex
					gap="0.3rem"
					direction={isLanguageRTL ? "row-reverse" : "row"}
					justifyContent={isLanguageRTL ? "flex-end" : "flex-start"}
					className="distance-container"
				>
					<Text className="distance">{step.Distance?.toFixed(2)}</Text>
					<Text className="distance">
						{currentMapUnit === METRIC ? t("geofence_box__km__short.text") : t("geofence_box__mi__short.text")}
					</Text>
				</Flex>
			</View>
		</View>
	) : null;
};

export default memo(StepCard);
