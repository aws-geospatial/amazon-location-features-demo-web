/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { Button, Flex, Text } from "@aws-amplify/ui-react";
import { LogoSmall } from "@demo/assets";
import { Modal } from "@demo/atomicui/atoms";
import { appConfig } from "@demo/core/constants";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const {
	ROUTES: { TERMS }
} = appConfig;

interface WelcomeModalProps {
	open: boolean;
	onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ open, onClose }) => {
	const { t } = useTranslation();

	return (
		<Modal
			data-testid="welcome-modal"
			open={open}
			onClose={onClose}
			className="welcome-modal"
			hideCloseIcon
			content={
				<Flex className="welcome-content">
					<Flex gap={0} height="3.46rem" justifyContent="center" alignItems="center" marginBottom="1rem">
						<LogoSmall width="36px" height="36px" />
					</Flex>
					<Text className="bold medium-text" textAlign="center" whiteSpace="pre-line" marginBottom="1rem">
						{t("welcome_modal__heading.text")}
					</Text>
					<Text className="regular-text" textAlign="center" marginBottom="1rem">
						{t("welcome_modal__item_1.text")}{" "}
						<a href={TERMS} target="_blank" rel="noreferrer">
							{t("t&c.text")}
						</a>{" "}
						{t("welcome_modal__item_3.text")}
					</Text>
					<Button data-testid="welcome-modal-continue-button" variation="primary" onClick={onClose}>
						{t("continue.text")}
					</Button>
				</Flex>
			}
		/>
	);
};

export default WelcomeModal;
