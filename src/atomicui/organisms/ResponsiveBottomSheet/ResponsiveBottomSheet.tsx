/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { useMediaQuery } from "@demo/hooks";
import { BottomSheet } from "react-spring-bottom-sheet";

import "react-spring-bottom-sheet/dist/style.css";
import "./styles.scss";
import { Explore } from "../Explore";

interface IProps {
	SearchBoxEl: JSX.Element;
}

const ResponsiveBottomSheet: React.FC<IProps> = ({ SearchBoxEl }) => {
	const isDesktop = useMediaQuery("(min-width: 1024px)");
	const isMobile = useMediaQuery("(max-width: 425px)");
	const isTablet = !isDesktop && !isMobile;

	return (
		<>
			{(isTablet || isMobile) && (
				<BottomSheet
					open={true}
					blocking={false}
					snapPoints={({ maxHeight }) => [maxHeight * 0.09, maxHeight * 0.5, maxHeight * 0.97, maxHeight * 0.09]}
					header={<div style={{ padding: "1.7rem 0px" }}>{SearchBoxEl}</div>}
					className={`bottom-sheet ${isTablet ? "tablet" : "mobile"}`}
					data-amplify-theme="aws-location-theme"
				>
					<Explore />
				</BottomSheet>
			)}
		</>
	);
};

export default ResponsiveBottomSheet;
