/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { Text, View } from "@aws-amplify/ui-react";
import { IconSearch } from "@demo/assets";
import { useTranslation } from "react-i18next";
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
	title,
	text,
	textFontSize,
	textMargin,
	actionButton,
	textPadding = "1.23rem"
}) => {
	const { t } = useTranslation();

	return (
		<View className="not-found-card">
			<IconSearch className="nfc-search-icon" />
			<Text className="nfc-title">{title || t("not_found_card__title.text")}</Text>
			<Text padding={textPadding} margin={textMargin} className="nfc-text" variation="tertiary" fontSize={textFontSize}>
				{text || t("not_found_card__desc.text")}
			</Text>
			{actionButton}
		</View>
	);
};

export default NotFoundCard;
