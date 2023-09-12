/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useCallback, useEffect, useMemo, useState } from "react";

import { Button, Divider, Flex, Text } from "@aws-amplify/ui-react";
import { IconArrow, IconBackArrow, IconPoweredByAws1 } from "@demo/assets";
import { Modal } from "@demo/atomicui/atoms";
import { aboutModalData, appConfig } from "@demo/core/constants";
import { useAmplifyMap, useDeviceMediaQuery } from "@demo/hooks";
import { AboutOptionEnum, MapProviderEnum } from "@demo/types/Enums";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const {
	ROUTES: { SOFTWARE_ATTRIBUTIONS, TERMS },
	LINKS: { ESRI_ATTRIBUTION_LINK, HERE_ATTRIBUTION_LINK }
} = appConfig;
const {
	ABOUT: { VERSION, VERSION_VALUE, BUILD, COPYRIGHT },
	TERMS: { TERMS_PREFIX, TERMS_LINK_LABEL, TERMS_SUFFIX },
	ATTRIBUTIONS: { PARTNER_ATTRIBUTION_TITLE, SOFTWARE_ATTRIBUTION_TITLE, SOFTWARE_ATTRIBUTION_DESC }
} = aboutModalData;

interface AboutModalProps {
	open: boolean;
	onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ open, onClose }) => {
	const [selectedOption, setSelectedOption] = useState<AboutOptionEnum | undefined>(AboutOptionEnum.ATTRIBUTION);
	const { mapProvider } = useAmplifyMap();
	const { isDesktop, isMobile } = useDeviceMediaQuery();
	const attributeEl = document.querySelector<HTMLElement>(".mapboxgl-ctrl-attrib-inner");

	useEffect(() => {
		isMobile ? setSelectedOption(undefined) : setSelectedOption(AboutOptionEnum.ATTRIBUTION);
	}, [isMobile, setSelectedOption]);

	const handlePartnerLearnMore = useCallback(() => {
		mapProvider === MapProviderEnum.ESRI
			? window.open(ESRI_ATTRIBUTION_LINK, "_blank")
			: window.open(HERE_ATTRIBUTION_LINK, "_blank");
	}, [mapProvider]);
	const { t, i18n } = useTranslation();
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";

	const optionItems = useMemo(
		() => [
			{
				id: AboutOptionEnum.ATTRIBUTION,
				title: t("about_modal__attribution.text"),
				detailsComponent: (
					<Flex gap={0} direction="column" padding="0rem 1.23rem" alignItems="center">
						<Text className="small-text" fontFamily="AmazonEmber-Bold" marginTop="1.15rem" alignSelf="flex-start">
							{t(PARTNER_ATTRIBUTION_TITLE)}
						</Text>
						<Text className="more-tertiary-text" marginTop="1.15rem">
							{attributeEl?.innerText || ""}
						</Text>
						<Button
							data-testid="learn-more-button-partner-attribution"
							className="learn-more-button"
							variation="primary"
							margin="1.15rem 0 3rem 0"
							width="100%"
							onClick={handlePartnerLearnMore}
						>
							{t("learn_more.text")}
						</Button>
						<Text className="small-text" fontFamily="AmazonEmber-Bold" marginTop="1.15rem" alignSelf="flex-start">
							{t(SOFTWARE_ATTRIBUTION_TITLE)}
						</Text>
						<Text className="more-tertiary-text" marginTop="1.15rem" alignSelf="flex-start">
							{t(SOFTWARE_ATTRIBUTION_DESC)}
						</Text>
						<Button
							className="learn-more-button"
							variation="primary"
							marginTop="1.15rem"
							width="100%"
							onClick={() => window.open(SOFTWARE_ATTRIBUTIONS, "_blank")}
						>
							{t("learn_more.text")}
						</Button>
					</Flex>
				)
			},
			{
				id: AboutOptionEnum.VERSION,
				title: t("about_modal__version.text"),
				detailsComponent: (
					<Flex gap={0} direction="column" padding="0rem 1.15rem">
						<Text className={`more-secondary-text ${isLtr ? "ltr" : "rtl"}`}>
							{t(VERSION)}: {VERSION_VALUE} {BUILD}
						</Text>
						<Text className={`more-secondary-text ${isLtr ? "ltr" : "rtl"}`}>{`© ${new Date().getFullYear()}${
							isLtr ? "," : "،"
						} ${t(COPYRIGHT)}`}</Text>
						<Flex gap={0} direction="column" padding="0rem 3.15rem">
							<IconPoweredByAws1 className="powered-by-aws-1-icon" />
						</Flex>
					</Flex>
				)
			},
			{
				id: AboutOptionEnum.TERMS_AND_CONDITIONS,
				title: t("t&c.text"),
				detailsComponent: (
					<Flex gap={0} direction="column" padding="0rem 1.15rem" alignItems="center">
						<Text className={`more-secondary-text ${isLtr ? "ltr" : "rtl"}`}>
							{t(TERMS_PREFIX)}
							<a href={TERMS} target="_blank" rel="noreferrer">
								{t(TERMS_LINK_LABEL)}
							</a>
							{t(TERMS_SUFFIX)}
						</Text>
					</Flex>
				)
			}
		],
		[attributeEl?.innerText, handlePartnerLearnMore, isLtr, t]
	);

	const renderOptionItems = useMemo(() => {
		return optionItems.map(({ id, title }) => (
			<Flex
				key={id}
				className={`option-item ${!isMobile && selectedOption === id ? "selected" : ""} ${
					isMobile ? "option-item-mobile" : ""
				}`}
				onClick={() => setSelectedOption(id)}
			>
				<Flex gap="0" alignItems="center">
					<Flex gap={0} direction="column">
						<Text className="small-text">{title}</Text>
					</Flex>
				</Flex>
				{isMobile && (
					<Flex className="option-arrow">
						<IconArrow className="grey-icon" />
					</Flex>
				)}
			</Flex>
		));
	}, [optionItems, selectedOption, isMobile]);

	const renderOptionDetails = useMemo(() => {
		const [optionItem] = optionItems.filter(({ id }) => selectedOption === id);

		if (!optionItem) return null;
		return (
			<>
				<Text data-testid="details-heading" className="small-text option-item" padding={"1.25rem 0rem 1.25rem 1.15rem"}>
					{isMobile && <IconBackArrow className="grey-icon back-arrow" onClick={() => setSelectedOption(undefined)} />}
					{optionItem.title}
				</Text>
				<Divider className="title-divider" />
				{optionItem.detailsComponent}
			</>
		);
	}, [isMobile, optionItems, selectedOption]);

	return (
		<Modal
			data-testid="about-modal-container"
			open={open}
			onClose={onClose}
			className={`more-modal ${isMobile ? "more-modal-mobile" : ""} ${!isDesktop ? "more-modal-tablet" : ""} `}
			content={
				<>
					{isMobile && !selectedOption && (
						<Flex className="more-title-container-mobile">
							<Text className="option-title">
								<IconBackArrow
									className="grey-icon back-arrow"
									onClick={() => {
										setSelectedOption(undefined);
										onClose();
									}}
								/>
								{t("about.text")}
							</Text>
							<Divider className="title-divider" />
						</Flex>
					)}
					<Flex className={`more-modal-content ${isMobile ? "more-modal-content-mobile" : ""}`}>
						{(!selectedOption || !isMobile) && (
							<Flex className="options-container">
								{!isMobile && (
									<Text className="bold regular-text" padding={"1.23rem 0rem 1.23rem 1.23rem"}>
										{t("about.text")}
									</Text>
								)}
								{renderOptionItems}
							</Flex>
						)}
						{!isMobile && <Divider orientation="vertical" className="col-divider" />}
						{!!selectedOption && <Flex className="option-details-container">{renderOptionDetails}</Flex>}
					</Flex>
				</>
			}
		/>
	);
};

export default AboutModal;
