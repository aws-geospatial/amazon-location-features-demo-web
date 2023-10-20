/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { memo, useCallback, useEffect, useState } from "react";

import { SuggestionMarker } from "@demo/atomicui/molecules";
import { useAwsPlace } from "@demo/hooks";
import { SuggestionType } from "@demo/types";
import { uuid } from "@demo/utils/uuid";

interface Props {
	latitude: number;
	longitude: number;
	searchValue: string;
	setSearchValue: (v: string) => void;
}

const Marker: React.FC<Props> = ({ latitude, longitude, searchValue, setSearchValue }) => {
	const [info, setInfo] = useState<SuggestionType>();
	const { getPlaceDataByCoordinates, setMarker, marker, selectedMarker } = useAwsPlace();

	if (marker && selectedMarker) setMarker(undefined);

	const loadPlaceInfo = useCallback(async () => {
		const pd = await getPlaceDataByCoordinates([longitude, latitude]);
		setInfo({ ...pd?.Results[0], Id: uuid.randomUUID() });
	}, [getPlaceDataByCoordinates, latitude, longitude]);

	useEffect(() => {
		if (!info) {
			loadPlaceInfo();
		}
	}, [info, loadPlaceInfo]);

	if (info) {
		return (
			<SuggestionMarker
				active={true}
				{...info}
				onClosePopUp={() => setMarker(undefined)}
				searchValue={searchValue}
				setSearchValue={setSearchValue}
			/>
		);
	} else {
		return null;
	}
};

export default memo(Marker);
