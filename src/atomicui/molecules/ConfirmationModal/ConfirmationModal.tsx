/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { Button, Flex, Text } from "@aws-amplify/ui-react";
import { Modal } from "@demo/atomicui/molecules";
import "./styles.scss";

interface ConfirmationModalProps {
	open: boolean;
	onClose: () => void;
	heading?: string;
	description?: string | React.ReactNode;
	onConfirm: () => void;
	confirmationText?: string;
	hideCancelButton?: boolean;
	cancelationText?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
	open,
	onClose,
	heading = "Confirmation",
	description = "Are you sure?",
	onConfirm,
	confirmationText = "Continue",
	hideCancelButton = false,
	cancelationText = "Cancel"
}) => {
	return (
		<Modal
			open={open}
			onClose={onClose}
			className="confirmation-modal"
			hideCloseIcon
			content={
				<Flex className="confirmation-content">
					<Text className="bold medium-text" textAlign="center">
						{heading}
					</Text>
					{typeof description === "string" ? (
						<Text
							className="regular-text"
							variation="tertiary"
							marginTop="1.23rem"
							textAlign="center"
							whiteSpace="pre-line"
						>
							{description}
						</Text>
					) : (
						description
					)}
					<Button variation="primary" fontFamily="AmazonEmber-Bold" marginTop="2.46rem" onClick={onConfirm}>
						{confirmationText}
					</Button>
					{!hideCancelButton && (
						<Flex className="confirmation-cancel-button" onClick={onClose}>
							<Text className="bold" fontSize="1.08rem" textAlign="center">
								{cancelationText}
							</Text>
						</Flex>
					)}
				</Flex>
			}
		/>
	);
};

export default ConfirmationModal;
