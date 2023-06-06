/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React from "react";

import { Card, CardProps, Flex } from "@aws-amplify/ui-react";
import { IconClose } from "@demo/assets";
import "./styles.scss";

interface ModalProps extends CardProps {
	open: boolean;
	onClose: () => void;
	modalContainerPosition?: string;
	modalContainerClass?: string;
	content: React.ReactNode;
	hideCloseIcon?: boolean;
	disableBodyScrollWhenModalIsOpen?: boolean;
}

const Modal: React.FC<ModalProps> = ({
	open,
	onClose,
	modalContainerClass = "",
	modalContainerPosition = "absolute",
	className = "",
	content,
	hideCloseIcon = false,
	disableBodyScrollWhenModalIsOpen = false,
	...rest
}) => {
	return open ? (
		<Flex
			data-testid={"modal-container"}
			className={`modal-container ${modalContainerClass} ${
				open && disableBodyScrollWhenModalIsOpen ? "disable-body-scroll" : ""
			}`}
			position={modalContainerPosition}
			top={0}
			right={0}
			bottom={0}
			left={0}
			onClick={onClose}
		>
			<Card {...rest} className={`modal-card ${className}`} onClick={e => e.stopPropagation()}>
				<Flex
					data-testid="modal-close-icon-container"
					className={hideCloseIcon ? "modal-close disabled" : "modal-close"}
					onClick={onClose}
				>
					<IconClose />
				</Flex>
				{content}
			</Card>
		</Flex>
	) : null;
};

export default Modal;
