import { FC, ReactElement } from "react";

import { Flex, FlexProps, Text } from "@aws-amplify/ui-react";
import "./styles.scss";

export interface IconicInfoCardProps extends FlexProps {
	IconComponent?: ReactElement;
	title: string;
	description?: string;
	textContainerMarginLeft?: string;
	cardMargin?: string;
	cardAlignItems?: string;
	subDescription?: string;
	gap?: string;
	direction?: "row" | "row-reverse" | string;
	onClickHandler?: () => void;
	titleColor?: string;
	isTitleBold?: boolean;
}

const IconicInfoCard: FC<IconicInfoCardProps> = ({
	IconComponent,
	title,
	description,
	textContainerMarginLeft = "0.7rem",
	cardMargin = "1rem 0",
	cardAlignItems = "flex-start",
	subDescription = "",
	gap = "large",
	direction = "row",
	onClickHandler,
	titleColor = "",
	isTitleBold = false,
	style
}) => {
	return (
		<Flex
			className={`iconic-container-${direction}`}
			direction={direction}
			gap={gap}
			margin={cardMargin}
			alignItems={cardAlignItems}
			onClick={onClickHandler}
			style={style}
		>
			{IconComponent}
			<Flex direction="column" gap={subDescription ? 0 : "3px"} marginLeft={textContainerMarginLeft}>
				<Text
					className={isTitleBold ? "bold" : "regular"}
					fontSize="1rem"
					variation="secondary"
					data-testid="iconic-info-card-title"
					color={titleColor}
				>
					{title}
				</Text>
				{description && (
					<Text
						color={"var(--grey-color)"}
						fontSize="1rem"
						variation="tertiary"
						data-testid="iconic-info-card-description"
					>
						{description}
					</Text>
				)}
				{subDescription && (
					<Text
						color="var(--grey-color)"
						fontSize="1rem"
						variation="tertiary"
						data-testid="iconic-info-card-subdescription"
					>
						{subDescription}
					</Text>
				)}
			</Flex>
		</Flex>
	);
};

export default IconicInfoCard;
