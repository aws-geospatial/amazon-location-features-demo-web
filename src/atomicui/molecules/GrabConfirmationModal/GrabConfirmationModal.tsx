/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { Text } from "@aws-amplify/ui-react";
import { ConfirmationModal } from "@demo/atomicui/molecules";
import { appConfig } from "@demo/core/constants";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const {
	LINKS: { GRAB_DEVELOPER_GUIDE }
} = appConfig;

interface GrabConfirmationModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	showDoNotAskAgainCheckbox?: boolean;
	onConfirmationCheckboxOnChange?: (e: boolean) => void;
	isUnauthSimulationOpen: boolean;
}

const GrabConfirmationModal: React.FC<GrabConfirmationModalProps> = ({
	open,
	onClose,
	onConfirm,
	showDoNotAskAgainCheckbox,
	onConfirmationCheckboxOnChange,
	isUnauthSimulationOpen
}) => {
	const { t } = useTranslation();

	return (
		<ConfirmationModal
			className={`grab-confirmation-modal ${isUnauthSimulationOpen ? "increased-max-height" : ""}`}
			open={open}
			onClose={onClose}
			heading={t("grab_cm__heading.text") as string}
			description={
				<>
					<Text
						className="small-text"
						variation="tertiary"
						marginTop="1.23rem"
						textAlign="center"
						whiteSpace="pre-line"
					>
						{t("grab_cm__desc.text")}
					</Text>
					{isUnauthSimulationOpen && (
						<Text
							className="small-text bold"
							variation="tertiary"
							marginTop="1.23rem"
							textAlign="center"
							whiteSpace="pre-line"
						>
							{t("grab_cm__unauth_simulaiton.text")}
						</Text>
					)}
				</>
			}
			onConfirm={onConfirm}
			confirmationText={t("grab_cm__heading.text") as string}
			showLearnMore={true}
			handleLearnMore={() => window.open(GRAB_DEVELOPER_GUIDE, "_blank")}
			showConfirmationCheckbox={showDoNotAskAgainCheckbox}
			confirmationCheckboxLabel={t("grab_cm__checkbox.text") as string}
			confirmationCheckboxValue={t("grab_cm__checkbox.text") as string}
			confirmationCheckboxName="confirmationCheckboxName"
			confirmationCheckboxOnChange={onConfirmationCheckboxOnChange}
		/>
	);
};

export default GrabConfirmationModal;
