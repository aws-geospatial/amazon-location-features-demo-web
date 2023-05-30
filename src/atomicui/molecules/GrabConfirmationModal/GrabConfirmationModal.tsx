/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

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
			description={"Grab map provider only operated in Southeast Asia and Asia Pacific (Singapore) Region."}
			onConfirm={onConfirm}
			confirmationText={"Enable Grab"}
			showLearnMore={true}
			handleLeanMore={() => window.open(GRAB_DEVELOPER_GUIDE, "_blank")}
		/>
	);
};

export default GrabConfirmationModal;
