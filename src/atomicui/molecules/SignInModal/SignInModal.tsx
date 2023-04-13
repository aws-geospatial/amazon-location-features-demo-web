/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { Button, Flex } from "@aws-amplify/ui-react";
import { IconGeofence, IconRoute } from "@demo/assets";
import { TextEl } from "@demo/atomicui/atoms";
import { Modal } from "@demo/atomicui/molecules";
import { useAmplifyAuth } from "@demo/hooks";
import "./styles.scss";

interface SignInModalProps {
	open: boolean;
	onClose: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ open, onClose }) => {
	const { onLogin } = useAmplifyAuth();

	return (
		<Modal
			open={open}
			onClose={onClose}
			className="sign-in-modal"
			content={
				<Flex className="sign-in-modal-content">
					<Flex gap={0} justifyContent="space-between" alignSelf="center" width="152px">
						<Flex className="sign-in-modal-icon-container">
							<IconRoute />
						</Flex>
						<Flex className="sign-in-modal-icon-container">
							<IconGeofence />
						</Flex>
					</Flex>
					<TextEl
						fontFamily="AmazonEmber-Bold"
						fontSize="20px"
						lineHeight="28px"
						marginTop="40px"
						textAlign="center"
						text="Sign in required"
					/>
					<TextEl
						variation="tertiary"
						marginTop="16px"
						textAlign="center"
						whiteSpace="pre-line"
						text={"Sign in to access Tracking and Geofence features or\nproceed to Explore the map"}
					/>
					<Button variation="primary" fontFamily="AmazonEmber-Bold" marginTop="32px" onClick={() => onLogin()}>
						Sign in
					</Button>
					<Flex className="maybe-later-button" onClick={onClose}>
						<TextEl
							fontFamily="AmazonEmber-Bold"
							fontSize="14px"
							lineHeight="16px"
							textAlign="center"
							text="Maybe later"
						/>
					</Flex>
				</Flex>
			}
		/>
	);
};

export default SignInModal;
