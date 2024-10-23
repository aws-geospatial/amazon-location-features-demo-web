/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, memo, useEffect, useState } from "react";

import { ReverseGeocodeCommandOutput, ReverseGeocodeResultItem } from "@aws-sdk/client-geoplaces";
import { SuggestionMarker } from "@demo/atomicui/molecules";
import { usePlace } from "@demo/hooks";
import { uuid } from "@demo/utils/uuid";

interface Props {
	latitude: number;
	longitude: number;
	searchValue: string;
	setSearchValue: (v: string) => void;
}

const Marker: FC<Props> = ({ latitude, longitude, searchValue, setSearchValue }) => {
	const [info, setInfo] = useState<{ id: string; place: ReverseGeocodeResultItem }>();
	const { getPlaceDataByCoordinates, setMarker, marker, selectedMarker } = usePlace();

	if (marker && selectedMarker) setMarker(undefined);

	useEffect(() => {
		if (!info) {
			(async () => {
				const place: ReverseGeocodeCommandOutput | undefined = await getPlaceDataByCoordinates([longitude, latitude]);
				setInfo({ id: uuid.randomUUID(), place: place!.ResultItems![0] });
			})();
		}
	}, [info, getPlaceDataByCoordinates, longitude, latitude]);

	if (!!info && !!info.place.PlaceId) {
		return (
			<SuggestionMarker
				id={info.id}
				placeId={info.place.PlaceId}
				position={info.place.Position}
				address={info.place.Address}
				label={info.place.Address!.Label}
				active={true}
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
