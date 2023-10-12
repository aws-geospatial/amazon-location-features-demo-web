import React from "react";

import { Flex, Text } from "@aws-amplify/ui-react";

import "./styles.scss";
import { useTranslation } from "react-i18next";

interface IProps {
	text: string;
	icon: JSX.Element;
	onClick: () => void;
}

const ExploreButton: React.FC<IProps> = ({ text, icon, onClick }) => {
	const { i18n } = useTranslation();
	const currentLanguage = i18n.language;

	return (
		<Flex
			data-testid="explore-button-container"
			direction="column"
			className={`explore-button-container ${["en"].includes(currentLanguage) ? "no-min-width-button" : ""}`}
			gap="0"
			onClick={onClick}
		>
			<Flex className="button-icon">{icon}</Flex>
			<Text className="button-text">{text}</Text>
		</Flex>
	);
};

export default ExploreButton;
