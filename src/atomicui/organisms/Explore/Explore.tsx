/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { Button, Flex, Text } from "@aws-amplify/ui-react";
import {
	IconArrow,
	IconAwsCloudFormation,
	IconDirections,
	IconGeofencePlusSolid,
	IconMapSolid,
	IconRadar
} from "@demo/assets";
import { ExploreButton } from "@demo/atomicui/atoms";
import { IconicInfoCard } from "@demo/atomicui/molecules";
import BottomSheetHeights from "@demo/core/constants/bottomSheetHeights";
import { useBottomSheet } from "@demo/hooks";
import { ResponsiveUIEnum } from "@demo/types/Enums";
import { useTranslation } from "react-i18next";
import "./styles.scss";

interface IProps {
	updateUIInfo: (ui: ResponsiveUIEnum) => void;
}

const Explore: React.FC<IProps> = ({ updateUIInfo }) => {
	const { t } = useTranslation();
	const { setBottomSheetMinHeight, setBottomSheetHeight } = useBottomSheet();
	return (
		<Flex direction="column" className="explore-container" gap="0">
			<Flex className="feature-container">
				<ExploreButton
					text={t("routes.text")}
					icon={<IconDirections width="1.53rem" height="1.53rem" fill="white" />}
					onClick={() => {
						updateUIInfo(ResponsiveUIEnum.routes);
						setBottomSheetMinHeight(BottomSheetHeights.routes.min);
						setBottomSheetHeight(BottomSheetHeights.routes.max);
					}}
				/>
				<ExploreButton
					text={t("map_style.text")}
					icon={<IconMapSolid width="1.53rem" height="1.53rem" fill="white" />}
					onClick={() => {
						updateUIInfo(ResponsiveUIEnum.map_styles);
						setBottomSheetMinHeight(BottomSheetHeights.map_styles.min);
						setBottomSheetHeight(BottomSheetHeights.map_styles.max);
					}}
				/>
				<ExploreButton
					text={t("trackers.text")}
					icon={<IconRadar width="1.53rem" height="1.53rem" />}
					onClick={() => updateUIInfo(ResponsiveUIEnum.trackers)}
				/>
				<ExploreButton
					text={t("geofences.text")}
					icon={<IconGeofencePlusSolid width="1.53rem" height="1.53rem" fill="white" />}
					onClick={() => updateUIInfo(ResponsiveUIEnum.geofences)}
				/>
			</Flex>
			<Flex direction="column" className="aws-connect-container">
				<Flex alignItems="center">
					<IconAwsCloudFormation width="1.2rem" height="1.38rem" />
					<Text fontFamily="AmazonEmber-Bold" fontSize="1.23rem">
						{t("explore__connect_aws_account.text")}
					</Text>
				</Flex>
				<Text fontFamily="AmazonEmber-Regular" fontSize="1rem" color="var(--grey-color)">
					{t("explore__connect_description.text")}
				</Text>
				<Button variation="primary" width="100%" height="3.07rem" onClick={() => {}}>
					{t("caam__connect.text")}
				</Button>
			</Flex>
			<Flex direction="column" gap="0" margin="0 1rem" className="explore-more-options">
				<IconicInfoCard
					gap="0"
					IconComponent={<IconArrow className="reverse-icon" width={20} height={20} />}
					title={t("header__overview.text")}
					description={"Description text will be there"}
					cardMargin={"2rem 0 0.923rem 0"}
					direction="row-reverse"
					cardAlignItems="center"
				/>
				<IconicInfoCard
					gap="0"
					IconComponent={<IconArrow className="reverse-icon" width={20} height={20} />}
					title={t("samples.text")}
					description={"Description text will be there"}
					cardMargin={"0.923rem 0"}
					direction="row-reverse"
					cardAlignItems="center"
				/>
				<IconicInfoCard
					gap="0"
					IconComponent={<IconArrow className="reverse-icon" width={20} height={20} />}
					title={t("settings.text")}
					description={"Description text will be there"}
					cardMargin={"0.923rem 0"}
					direction="row-reverse"
					cardAlignItems="center"
				/>
				<IconicInfoCard
					gap="0"
					IconComponent={<IconArrow className="reverse-icon" width={20} height={20} />}
					title={t("about.text")}
					description={"Description text will be there"}
					cardMargin={"0.923rem 0"}
					direction="row-reverse"
					cardAlignItems="center"
				/>
			</Flex>
		</Flex>
	);
};

export default Explore;
