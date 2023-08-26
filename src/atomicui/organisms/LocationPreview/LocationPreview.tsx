/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useCallback, useEffect, useState } from "react";

import { Marker } from "@demo/atomicui/molecules";
import { useAwsPlace } from "@demo/hooks";
import { ResponsiveUIEnum } from "@demo/types/Enums";
import "./styles.scss";
import { SuggestionType } from "aws-sdk/clients/kendra";

interface IProps {
	updateUIInfo: (ui: ResponsiveUIEnum) => void;
	searchValue: string;
	setSearchValue: (v: string) => void;
}

const LocationPreview: React.FC<IProps> = ({ updateUIInfo, searchValue, setSearchValue }) => {
	const [info, setInfo] = useState(undefined);
	const { getPlaceData, setSelectedMarker, suggestions, hoveredMarker, setHoveredMarker, clearPoiList } = useAwsPlace();

	const getPlaceInfo = useCallback(
		async (placeId: string) => {
			const pd = await getPlaceData(placeId);
			setInfo({ Place: pd?.Place });
		},
		[getPlaceData]
	);

	const setPlaceInfo = useCallback(() => setInfo({ Place }), [Place]);

	useEffect(() => {
		if (PlaceId) {
			getPlaceInfo(PlaceId);
		} else {
			setPlaceInfo();
		}
	}, [PlaceId, getPlaceInfo, setPlaceInfo]);

	useEffect(() => {
		if (info && active && !!searchValue) {
			setSearchValue(info.Place?.Label || "");
		}
	}, [info, active, searchValue, setSearchValue]);

	const select = useCallback(
		async (id?: string) => {
			if (id) {
				const selectedMarker = suggestions?.find((i: SuggestionType) => i.PlaceId === id || i.Place?.Label === id);
				await setSelectedMarker(selectedMarker);
			} else {
				await setSelectedMarker(undefined);
			}
		},
		[suggestions, setSelectedMarker]
	);

	return marker ? <Marker searchValue={searchValue} setSearchValue={setSearchValue} {...marker} /> : null;
};

export default LocationPreview;
