/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, lazy } from "react";

import { Button, Flex, Text } from "@aws-amplify/ui-react";
import { IconPoweredByAws1, LogoSmall } from "@demo/assets/svgs";
import { appConfig } from "@demo/core/constants";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const Modal = lazy(() => import("@demo/atomicui/atoms/Modal").then(module => ({ default: module.Modal })));

const {
	LINKS: { AWS_CUSTOMER_AGREEMENT, AWS_ACCEPTABLE_USE_POLICY, AWS_PRIVACY_NOTICE }
} = appConfig;

interface WelcomeModalProps {
	open: boolean;
	onClose: () => void;
}

const WelcomeModal: FC<WelcomeModalProps> = ({ open, onClose }) => {
	const { t } = useTranslation();

	return (
		<Modal
			data-testid="welcome-modal"
			open={open}
			onClose={onClose}
			className="welcome-modal"
			content={
				<Flex className="welcome-content">
					<Flex className="logo-container">
						<LogoSmall />
					</Flex>
					<Text className="bold heading" textAlign="center" whiteSpace="pre-line">
						{t("welcome_modal__heading.text")}
					</Text>
					<Button
						data-testid="welcome-modal-continue-button"
						className="bold cta-button"
						variation="primary"
						onClick={onClose}
					>
						{t("welcome_modal__cta.text")}
					</Button>
					<Flex className="tnc-container">
						<IconPoweredByAws1 />
						<Text className="regular text">
							By downloading, installing, or using the App, you agree to the{" "}
							<a href={AWS_CUSTOMER_AGREEMENT} target="_blank" rel="noreferrer">
								AWS Customer Agreement
							</a>
							,{" "}
							<a href={AWS_ACCEPTABLE_USE_POLICY} target="_blank" rel="noreferrer">
								AWS Acceptable Use Policy
							</a>
							, and the{" "}
							<a href={AWS_PRIVACY_NOTICE} target="_blank" rel="noreferrer">
								AWS Privacy Notice
							</a>
							. If you already have an AWS Customer Agreement or Enterprise Agreement, you agree that the terms of that
							agreement govern your download, installation, and use of this App. These Terms & Conditions supplement
							those Agreements.
						</Text>
						<Text className="regular copyright">
							{`© ${new Date().getFullYear()}, Amazon Web Services, Inc. or its affiliates. All rights reserved.`}
						</Text>
					</Flex>
				</Flex>
			}
		/>
	);
};

export default WelcomeModal;
