/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { Text } from "@aws-amplify/ui-react";
import { ConfirmationModal } from "@demo/atomicui/molecules";
import { appConfig } from "@demo/core/constants";
import "./styles.scss";

const {
	LINKS: { GRAB_DEVELOPER_GUIDE }
} = appConfig;

interface GrabConfirmationModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const GrabConfirmationModal: React.FC<GrabConfirmationModalProps> = ({ open, onClose, onConfirm }) => {
	return (
		<ConfirmationModal
			open={open}
			onClose={onClose}
			heading={"Enable Grab"}
			description={
				<Text className="small-text" variation="tertiary" marginTop="1.23rem" textAlign="center" whiteSpace="pre-line">
					{`Grab provides Maps, Routes and Place search in Malaysia, Philippines, Thailand, Singapore, Vietnam, Indonesia, Myanmar, and Cambodia.\n
					While car and motorcycle routes are available across the above countries, the bicycle and walking routes are supported in only key cities such as Singapore, Jakarta, Manila, Klang Valley, Bangkok, Ho Chi Minh City, and Hanoi.`}
				</Text>
			}
			onConfirm={onConfirm}
			confirmationText={"Enable Grab"}
			showLearnMore={true}
			handleLeanMore={() => window.open(GRAB_DEVELOPER_GUIDE, "_blank")}
		/>
	);
};

export default GrabConfirmationModal;
