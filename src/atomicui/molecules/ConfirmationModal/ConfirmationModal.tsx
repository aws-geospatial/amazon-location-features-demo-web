/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { Button, CheckboxField, Flex, Text } from "@aws-amplify/ui-react";
import { Modal } from "@demo/atomicui/atoms";
import { useTranslation } from "react-i18next";
import "./styles.scss";

interface ConfirmationModalProps {
	className?: string;
	open: boolean;
	onClose: () => void;
	heading?: string;
	description?: string | React.ReactNode;
	onConfirm: () => void;
	confirmationText?: string;
	showLearnMore?: boolean;
	handleLearnMore?: () => void;
	hideCancelButton?: boolean;
	cancelationText?: string;
	showConfirmationCheckbox?: boolean;
	confirmationCheckboxLabel?: string;
	confirmationCheckboxValue?: string;
	confirmationCheckboxName?: string;
	confirmationCheckboxOnChange?: (e: boolean) => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
	className = "",
	open,
	onClose,
	heading,
	description,
	onConfirm,
	confirmationText,
	showLearnMore = false,
	handleLearnMore = () => {},
	hideCancelButton = false,
	cancelationText,
	showConfirmationCheckbox,
	confirmationCheckboxLabel,
	confirmationCheckboxValue,
	confirmationCheckboxName,
	confirmationCheckboxOnChange = () => {}
}) => {
	const { t } = useTranslation();
	const [isConfirmationChecked, setIsConfirmationChecked] = React.useState(false);

	return (
		<Modal
			data-testid="confirmation-modal-container"
			open={open}
			onClose={onClose}
			className={`confirmation-modal ${className}`}
			hideCloseIcon
			content={
				<Flex className="confirmation-content">
					<Text className="bold medium-text" textAlign="center">
						{heading || t("confirmation_modal__heading.text")}
					</Text>
					{typeof description === "string" ? (
						<Text
							className="regular-text"
							variation="tertiary"
							marginTop="1.23rem"
							textAlign="center"
							whiteSpace="pre-line"
						>
							{description || t("confirmation_modal__desc.text")}
						</Text>
					) : (
						description
					)}
					{showConfirmationCheckbox && (
						<CheckboxField
							className="custom-checkbox confirmation-checkbox"
							size="large"
							label={confirmationCheckboxLabel || ""}
							name={confirmationCheckboxName || ""}
							value={confirmationCheckboxValue || ""}
							checked={isConfirmationChecked}
							onChange={e => {
								setIsConfirmationChecked(e.target.checked);
								confirmationCheckboxOnChange(e.target.checked);
							}}
							marginTop="2rem"
							crossOrigin={undefined}
						/>
					)}
					<Button
						data-testid="confirmation-button"
						variation="primary"
						fontFamily="AmazonEmber-Bold"
						marginTop={showConfirmationCheckbox ? "2rem" : "2.46rem"}
						onClick={onConfirm}
						height="3.08rem"
					>
						{confirmationText || t("continue.text")}
					</Button>
					{showLearnMore && (
						<Flex
							data-testid="confirmation-learn-more-button"
							className="confirmation-learn-more-button"
							onClick={handleLearnMore}
						>
							<Text className="bold" fontSize="1.08rem" textAlign="center">
								{t("learn_more.text")}
							</Text>
						</Flex>
					)}
					{!hideCancelButton && (
						<Flex data-testid="confirmation-cancel-button" className="confirmation-cancel-button" onClick={onClose}>
							<Text className="bold" fontSize="1.08rem" textAlign="center">
								{cancelationText || t("confirmation_modal__cancel.text")}
							</Text>
						</Flex>
					)}
				</Flex>
			}
		/>
	);
};

export default ConfirmationModal;
