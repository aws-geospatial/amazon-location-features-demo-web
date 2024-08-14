/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";

import { View } from "@aws-amplify/ui-react";
import { IconSelected, IconSuggestion } from "@demo/assets/svgs";
import { usePlace } from "@demo/hooks";
import { SuggestionType } from "@demo/types";
import { Marker } from "react-map-gl";

import { Popup } from "../Popup";

interface Props extends SuggestionType {
	active?: boolean;
	onClosePopUp?: () => void;
	searchValue: string;
	setSearchValue: (v: string) => void;
}

const SuggestionMarker: FC<Props> = ({
	Id,
	PlaceId,
	Text,
	Place,
	active,
	onClosePopUp,
	searchValue,
	setSearchValue,
	...rest
}) => {
	const [info, setInfo] = useState<SuggestionType | undefined>(undefined);
	const { getPlaceData, setSelectedMarker, suggestions, hoveredMarker, setHoveredMarker, clearPoiList } = usePlace();

	const getPlaceInfo = useCallback(
		async (placeId: string) => {
			const pd = await getPlaceData(placeId);
			setInfo({ Id, Place: pd?.Place });
		},
		[Id, getPlaceData]
	);

	const setPlaceInfo = useCallback(() => setInfo({ Id, Place }), [Id, Place]);

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
		async (str?: string) => {
			if (str) {
				const selectedMarker = suggestions?.find(
					(i: SuggestionType) => i.PlaceId === str || (i.Place?.Label === str && i.Id === Id)
				);
				await setSelectedMarker(selectedMarker);
			} else {
				await setSelectedMarker(undefined);
			}
		},
		[suggestions, setSelectedMarker, Id]
	);

	const markerDescription = useMemo(() => {
		const string = Text || Place?.Label || "";
		return string.split(",")[0];
	}, [Place?.Label, Text]);

	const isHovered = useMemo(
		() =>
			hoveredMarker &&
			(hoveredMarker.PlaceId
				? hoveredMarker.PlaceId === PlaceId
				: hoveredMarker.Place?.Label === Place?.Label && hoveredMarker.Id === Id),
		[hoveredMarker, PlaceId, Place?.Label, Id]
	);

	const setHover = useCallback(
		(marker: SuggestionType) => {
			setHoveredMarker(marker);
		},
		[setHoveredMarker]
	);

	if (info && info.Place?.Geometry?.Point) {
		return (
			<Marker
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					cursor: "pointer",
					zIndex: active || isHovered ? 2 : 1,
					textShadow: "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff"
				}}
				clickTolerance={22}
				longitude={info.Place?.Geometry.Point[0]}
				latitude={info.Place?.Geometry.Point[1]}
				onClick={async e => {
					e.originalEvent.preventDefault();
					e.originalEvent.stopPropagation();
					await select((PlaceId || Place?.Label) as string);
				}}
			>
				{active || isHovered ? (
					<IconSelected />
				) : (
					<IconSuggestion onMouseOver={() => setHover({ Id, PlaceId, Text, ...rest })} />
				)}
				{active ? (
					<Popup
						active={active}
						info={info}
						select={select}
						onClosePopUp={
							suggestions?.length === 1
								? () => {
										clearPoiList();
										setSearchValue("");
								  }
								: onClosePopUp
						}
						setInfo={setInfo}
					/>
				) : (
					<View
						style={{
							position: "absolute",
							width: "150px",
							top: "12px",
							left: "50px"
						}}
					>
						{markerDescription}
					</View>
				)}
			</Marker>
		);
	} else {
		return null;
	}
};

export default memo(SuggestionMarker);
