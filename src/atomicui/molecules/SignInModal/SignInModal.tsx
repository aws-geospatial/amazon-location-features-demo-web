/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, lazy } from "react";

import { Button, Flex, Text } from "@aws-amplify/ui-react";
import { IconGeofence, IconRoute } from "@demo/assets/svgs";
import { useAuth } from "@demo/hooks";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import { EventTypeEnum, TriggeredByEnum } from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const Modal = lazy(() => import("@demo/atomicui/atoms/Modal").then(module => ({ default: module.Modal })));

interface SignInModalProps {
	open: boolean;
	onClose: () => void;
}

const SignInModal: FC<SignInModalProps> = ({ open, onClose }) => {
	const { onLogin } = useAuth();
	const { t } = useTranslation();
	const { isMobile } = useDeviceMediaQuery();

	return (
		<Modal
			data-testid="sign-in-modal"
			open={open}
			onClose={onClose}
			className={`sign-in-modal ${isMobile ? "sign-in-modal-mobile" : ""}`}
			content={
				<Flex className="sign-in-modal-content">
					<Flex gap={0} justifyContent="space-between" alignSelf="center" width="152px">
						<Flex className="sign-in-modal-icon-container">
							<IconRoute />
						</Flex>
						<Flex className="sign-in-modal-icon-container">
							<IconGeofence />
						</Flex>
					</Flex>
					<Text className="bold" fontSize="1.54rem" marginTop="3.08rem" textAlign="center">
						{t("sign_in_modal__1.text")}
					</Text>
					<Text variation="tertiary" marginTop="1.23rem" textAlign="center" whiteSpace="pre-line">
						{t("sign_in_modal__2.text")}
					</Text>
					<Button
						data-testid="sign-in-button"
						variation="primary"
						fontFamily="AmazonEmber-Bold"
						marginTop="2.46rem"
						onClick={async () => {
							await record(
								[
									{
										EventType: EventTypeEnum.SIGN_IN_STARTED,
										Attributes: { triggeredBy: TriggeredByEnum.SIGN_IN_MODAL }
									}
								],
								["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
							);
							onClose();
							onLogin();
						}}
					>
						{t("sign_in.text")}
					</Button>
					<Flex className="maybe-later-button" onClick={onClose}>
						<Text data-testid="maybe-later-button" className="bold" fontSize="1.08rem" textAlign="center">
							{t("sign_in_modal__maybe_later.text")}
						</Text>
					</Flex>
				</Flex>
			}
		/>
	);
};

export default SignInModal;
