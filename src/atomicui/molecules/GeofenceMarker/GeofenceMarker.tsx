/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { View } from "@aws-amplify/ui-react";
import { IconGeofenceMarker } from "@demo/assets";
import { TextEl } from "@demo/atomicui/atoms";
import { Marker } from "react-map-gl";

interface GeofenceMarkerProps {
	lng: number;
	lat: number;
	description: string;
	showPointer?: boolean;
	onClick?: () => void;
}

const GeofenceMarker: React.FC<GeofenceMarkerProps> = ({
	lng,
	lat,
	description,
	showPointer = false,
	onClick = () => {}
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
			<View
				style={{
					position: "absolute",
					width: "150px",
					top: "10px",
					left: "35px"
				}}
			>
				<TextEl fontFamily="AmazonEmber-Bold" text={description} />
			</View>
		</Marker>
	);
};

export default GeofenceMarker;
