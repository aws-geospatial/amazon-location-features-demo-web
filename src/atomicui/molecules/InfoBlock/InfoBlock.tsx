/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { Text, View, ViewProps } from "@aws-amplify/ui-react";

import "./styles.scss";

interface InfoBlockProps extends ViewProps {
	title: string;
	body: React.ReactNode | string;
	className?: undefined | string;
}

const InfoBlock: React.FC<InfoBlockProps> = ({ title, body, className, ...rest }) => {
	return (
		<View className={`info-block regular-text ${className || ""}`} {...rest}>
			<View className="title-container">
				<Text>{title}</Text>
			</View>
			<View className="body-container">{body}</View>
		</View>
	);
};

export default InfoBlock;
