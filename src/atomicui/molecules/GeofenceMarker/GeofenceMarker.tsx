/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC } from "react";

import { Text, View } from "@aws-amplify/ui-react";
import { IconGeofenceMarker } from "@demo/assets/svgs";
import { Marker } from "react-map-gl/maplibre";

interface GeofenceMarkerProps {
	lng: number;
	lat: number;
	description: string;
	showPointer?: boolean;
	onClick?: () => void;
	hideDescription?: boolean;
}

const GeofenceMarker: FC<GeofenceMarkerProps> = ({
	lng,
	lat,
	description,
	showPointer = false,
	onClick = () => {},
	hideDescription = false
}) => {
	return (
		<Marker
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				zIndex: 1,
				textShadow: "-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff",
				cursor: showPointer ? "pointer" : ""
			}}
			longitude={lng}
			latitude={lat}
			onClick={onClick}
		>
			<IconGeofenceMarker />
			{!hideDescription && (
				<View
					style={{
						position: "absolute",
						width: "150px",
						top: "10px",
						left: "35px"
					}}
				>
					<Text className="bold">{description}</Text>
				</View>
			)}
		</Marker>
	);
};

export default GeofenceMarker;
