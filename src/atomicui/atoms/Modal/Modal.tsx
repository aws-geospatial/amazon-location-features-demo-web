/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC } from "react";

import { Card, CardProps, Flex } from "@aws-amplify/ui-react";
import { IconClose } from "@demo/assets/svgs";
import "./styles.scss";

interface ModalProps extends CardProps {
	open: boolean;
	onClose: () => void;
	modalContainerPosition?: string;
	modalContainerClass?: string;
	hideCloseIcon?: boolean;
	disableBodyScrollWhenModalIsOpen?: boolean;
}

const Modal: FC<ModalProps> = ({
	open,
	onClose,
	modalContainerClass = "",
	modalContainerPosition = "absolute",
	className = "",
	children,
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
				{children}
			</Card>
		</Flex>
	) : null;
};

export default Modal;
