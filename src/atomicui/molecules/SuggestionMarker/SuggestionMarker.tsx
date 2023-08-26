/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";

import { View } from "@aws-amplify/ui-react";
import { IconSelected, IconSuggestion } from "@demo/assets";
import { Popup } from "@demo/atomicui/molecules";
import { useAwsPlace } from "@demo/hooks";
import { SuggestionType } from "@demo/types";
import { Marker } from "react-map-gl";

interface Props extends SuggestionType {
	active?: boolean;
	onClosePopUp?: () => void;
	searchValue: string;
	setSearchValue: (v: string) => void;
	POIOnly?: boolean;
}

const SuggestionMarker: React.FC<Props> = ({
	PlaceId,
	Text,
	Place,
	active,
	onClosePopUp,
	searchValue,
	setSearchValue,
	POIOnly,
	...rest
}) => {
	const [info, setInfo] = useState<SuggestionType | undefined>(undefined);
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

	const markerDescription = useMemo(() => {
		const string = Text || Place?.Label || "";
		return string.split(",")[0];
	}, [Place?.Label, Text]);

	const isHovered = useMemo(
		() =>
			hoveredMarker &&
			(hoveredMarker.PlaceId ? hoveredMarker.PlaceId === PlaceId : hoveredMarker.Place?.Label === Place?.Label),
		[hoveredMarker, PlaceId, Place?.Label]
	);

	const setHover = useCallback(
		(marker: SuggestionType) => {
			setHoveredMarker(marker);
		},
		[setHoveredMarker]
	);

	if (POIOnly && active && info && info.Place?.Geometry.Point) {
		return (
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
				POIOnly={POIOnly}
			/>
		);
	} else if (info && info.Place?.Geometry.Point) {
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
					<IconSuggestion onMouseOver={() => setHover({ PlaceId, Text, ...rest })} />
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
