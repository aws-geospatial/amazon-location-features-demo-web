/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, memo, useCallback, useEffect, useMemo, useState } from "react";

import { View } from "@aws-amplify/ui-react";
import { IconSelected, IconSuggestion } from "@demo/assets/svgs";
import { usePlace } from "@demo/hooks";
import { SuggestionType } from "@demo/types";
import { Marker } from "react-map-gl/maplibre";

import { Popup } from "../Popup";

interface Props extends SuggestionType {
	active?: boolean;
	onClosePopUp?: () => void;
	searchValue: string;
	setSearchValue: (v: string) => void;
}

const SuggestionMarker: FC<Props> = ({
	id,
	placeId,
	label,
	position,
	active,
	onClosePopUp,
	searchValue,
	setSearchValue
}) => {
	const [info, setInfo] = useState<SuggestionType | undefined>(undefined);
	const { getPlaceData, setSelectedMarker, suggestions, hoveredMarker, setHoveredMarker, clearPoiList } = usePlace();

	const getPlaceInfo = useCallback(
		async (placeId: string) => {
			const place = await getPlaceData(placeId);
			setInfo({ id, placeId, label, position, place });
		},
		[getPlaceData, id, label, position]
	);

	useEffect(() => {
		if (placeId && !info) {
			getPlaceInfo(placeId);
		}
	}, [placeId, info, getPlaceInfo]);

	useEffect(() => {
		if (info && active && !!searchValue) {
			setSearchValue(info.place?.Address?.Label as string);
		}
	}, [info, active, searchValue, setSearchValue]);

	const select = useCallback(
		async (id?: string) => {
			if (id) {
				const selectedMarker = suggestions?.find(s => s.id === id);
				await setSelectedMarker(selectedMarker);
			} else {
				await setSelectedMarker(undefined);
			}
		},
		[suggestions, setSelectedMarker]
	);

	const markerDescription = useMemo(() => {
		const string = info?.place?.Address?.Label || label || "";
		return string.split(",")[0];
	}, [info?.place?.Address?.Label, label]);

	const isHovered = useMemo(
		() => hoveredMarker && (hoveredMarker.placeId ? hoveredMarker.placeId === placeId : hoveredMarker.id === id),
		[hoveredMarker, id, placeId]
	);

	const setHover = useCallback(
		(marker: SuggestionType) => {
			setHoveredMarker(marker);
		},
		[setHoveredMarker]
	);

	if (info && info.place?.Position) {
		const {
			place: { Position }
		} = info;

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
				longitude={Position[0]}
				latitude={Position[1]}
				onClick={async e => {
					e.originalEvent.preventDefault();
					e.originalEvent.stopPropagation();
					await select(id);
				}}
			>
				{active || isHovered ? <IconSelected /> : <IconSuggestion onMouseOver={() => setHover(info)} />}
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
