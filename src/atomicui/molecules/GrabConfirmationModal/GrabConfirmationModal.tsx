/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { ConfirmationModal } from "@demo/atomicui/molecules";
import "./styles.scss";

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
			heading={"Grab Confirmation"}
			description={"Using Grab data provider will limit your mapping capabilities."}
			onConfirm={onConfirm}
			confirmationText={"Continue"}
			// hideCancelButton={false}
			// cancelationText={cancelationText}
		/>
	);
};

export default GrabConfirmationModal;
