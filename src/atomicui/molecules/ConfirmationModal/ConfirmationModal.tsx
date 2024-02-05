/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, ReactNode, lazy, useState } from "react";

import { Button, CheckboxField, Flex, Text } from "@aws-amplify/ui-react";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const Modal = lazy(() => import("@demo/atomicui/atoms/Modal").then(module => ({ default: module.Modal })));

export interface ConfirmationModalProps {
	className?: string;
	open: boolean;
	onClose: () => void;
	heading?: string;
	description?: string | ReactNode;
	onConfirm: () => void;
	confirmationText?: string;
	showLearnMore?: boolean;
	handleLearnMore?: () => void;
	hideCancelButton?: boolean;
	cancelationText?: string;
	onCancel?: () => void;
	showConfirmationCheckbox?: boolean;
	confirmationCheckboxLabel?: string;
	confirmationCheckboxValue?: string;
	confirmationCheckboxName?: string;
	confirmationCheckboxOnChange?: (e: boolean) => void;
}

const ConfirmationModal: FC<ConfirmationModalProps> = ({
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
	onCancel,
	showConfirmationCheckbox,
	confirmationCheckboxLabel,
	confirmationCheckboxValue,
	confirmationCheckboxName,
	confirmationCheckboxOnChange = () => {}
}) => {
	const { t } = useTranslation();
	const [isConfirmationChecked, setIsConfirmationChecked] = useState(false);
	const { isMobile } = useDeviceMediaQuery();

	return (
		<Modal
			data-testid="confirmation-modal-container"
			open={open}
			onClose={onClose}
			className={`confirmation-modal ${className} ${isMobile ? "confirmation-modal-mobile" : ""}`}
			hideCloseIcon
			content={
				<Flex data-testid="confirmation-content" className="confirmation-content">
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
							data-testid="confirmation-checkbox"
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
						<Flex
							data-testid="confirmation-cancel-button"
							className="confirmation-cancel-button"
							onClick={onCancel ? onCancel : onClose}
						>
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
