import React from "react";

import { Flex, Text } from "@aws-amplify/ui-react";

import "./styles.scss";

interface IProps {
	text: string;
	icon: JSX.Element;
}

const ExploreButton: React.FC<IProps> = ({ text, icon }) => {
	return (
		<Flex direction="column" className="explore-button-container" gap="0">
			<Flex className="button-icon">{icon}</Flex>
			<Text className="button-text">{text}</Text>
		</Flex>
	);
};

export default ExploreButton;
