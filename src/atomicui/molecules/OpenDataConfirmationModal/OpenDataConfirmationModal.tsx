/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC } from "react";

import { Text } from "@aws-amplify/ui-react";
import { ConfirmationModal } from "@demo/atomicui/molecules";
import { useTranslation } from "react-i18next";
import "./styles.scss";

interface OpenDataConfirmationModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	showDoNotAskAgainCheckbox?: boolean;
	onConfirmationCheckboxOnChange?: (e: boolean) => void;
}

const OpenDataConfirmationModal: FC<OpenDataConfirmationModalProps> = ({
	open,
	onClose,
	onConfirm,
	showDoNotAskAgainCheckbox,
	onConfirmationCheckboxOnChange
}) => {
	const { t } = useTranslation();

	return (
		<ConfirmationModal
			className={"openData-confirmation-modal"}
			open={open}
			onClose={onClose}
			heading={t("open_data_cm__heading.text") as string}
			description={
				<>
					<Text
						className="small-text"
						variation="tertiary"
						marginTop="1.23rem"
						textAlign="center"
						whiteSpace="pre-line"
					>
						{t("open_data_cm__desc.text")}
					</Text>
				</>
			}
			onConfirm={onConfirm}
			confirmationText={t("open_data_cm__heading.text") as string}
			showLearnMore={false}
			showConfirmationCheckbox={showDoNotAskAgainCheckbox}
			confirmationCheckboxLabel={t("grab_cm__checkbox.text") as string}
			confirmationCheckboxValue={t("grab_cm__checkbox.text") as string}
			confirmationCheckboxName="confirmationCheckboxName"
			confirmationCheckboxOnChange={onConfirmationCheckboxOnChange}
		/>
	);
};

export default OpenDataConfirmationModal;
