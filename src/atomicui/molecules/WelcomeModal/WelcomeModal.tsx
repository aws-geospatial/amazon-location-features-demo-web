/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { Button, Flex, Text } from "@aws-amplify/ui-react";
import { LogoSmall } from "@demo/assets";
import { Modal } from "@demo/atomicui/molecules";
import "./styles.scss";
import appConfig from "@demo/core/constants/appConfig";

const {
	ROUTES: { TERMS }
} = appConfig;

interface WelcomeModalProps {
	open: boolean;
	onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ open, onClose }) => {
	return (
		<Modal
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
						{"Welcome to\nAmazon Location Demo"}
					</Text>
					<Text className="regular-text" textAlign="center" marginBottom="1rem">
						By using the Amazon Location Demo App, you agree to the App&apos;s{" "}
						<a href={TERMS} target="_blank" rel="noreferrer">
							Terms & Conditions
						</a>{" "}
						for use.
					</Text>
					<Button variation="primary" onClick={onClose}>
						Continue
					</Button>
				</Flex>
			}
		/>
	);
};

export default WelcomeModal;
