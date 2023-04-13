/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { Text, TextProps } from "@aws-amplify/ui-react";

interface TextElProps extends TextProps {
	fontFamily?: "AmazonEmber-Regular" | "AmazonEmber-Medium" | "AmazonEmber-Bold";
	fontWeight?: number;
	fontSize?: string;
	lineHeight?: string;
	letterSpacing?: string;
	text: string;
}

const TextEl: React.FC<TextElProps> = ({
	fontFamily = "AmazonEmber-Regular",
	fontSize = "1rem",
	lineHeight = "1.38rem",
	letterSpacing = "0px",
	variation = "secondary",
	text,
	...rest
}) => {
	return (
		<Text
			{...rest}
			fontFamily={fontFamily}
			fontSize={fontSize}
			lineHeight={lineHeight}
			letterSpacing={letterSpacing}
			variation={variation}
		>
			{text}
		</Text>
	);
};

export default TextEl;
