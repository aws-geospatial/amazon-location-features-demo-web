/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { Text, View } from "@aws-amplify/ui-react";
import { IconSearch } from "@demo/assets";
import "./styles.scss";

interface IProps {
	title?: string;
	text?: string;
	textFontSize?: string;
	textMargin?: string;
	textPadding?: string;
	actionButton?: React.ReactNode;
}

const NotFoundCard: React.FC<IProps> = ({
	title = "No matching places found",
	text = "Make sure your search is spelled correctly. Try adding a city, postcode, or country.",
	textFontSize,
	textMargin,
	actionButton,
	textPadding
}) => (
	<View className="not-found-card">
		<IconSearch className="nfc-search-icon" />
		<Text className="nfc-title">{title}</Text>
		<Text padding={textPadding} margin={textMargin} className="nfc-text" variation="tertiary" fontSize={textFontSize}>
			{text}
		</Text>
		{actionButton}
	</View>
);

export default NotFoundCard;
