/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useMemo, useState } from "react";

import { Button, Flex, Link, Text, View } from "@aws-amplify/ui-react";
import { IconAwsCloudFormation, IconCheckMarkCircle } from "@demo/assets";
import { Modal, TextEl } from "@demo/atomicui/atoms";
import { InputField } from "@demo/atomicui/molecules";
import { appConfig, connectAwsAccountData } from "@demo/core/constants";
import { useAmplifyAuth, useAws } from "@demo/hooks";
import { ConnectFormValuesType } from "@demo/types";
import "./styles.scss";

const {
	ENV: { CF_TEMPLATE },
	ROUTES: { HELP },
	LINKS: { AWS_TERMS_AND_CONDITIONS }
} = appConfig;
const {
	TITLE,
	TITLE_DESC,
	HOW_TO,
	STEP1,
	STEP1_DESC,
	STEP2,
	STEP2_DESC,
	STEP3,
	STEP3_DESC,
	AGREE,
	POST_CONNECT,
	POST_CONNECT_DESC
} = connectAwsAccountData;

interface ConnectAwsAccountModalProps {
	open: boolean;
	onClose: () => void;
}

const ConnectAwsAccountModal: React.FC<ConnectAwsAccountModalProps> = ({ open, onClose }) => {
	const [formValues, setFormValues] = useState<ConnectFormValuesType>({
		IdentityPoolId: "",
		UserDomain: "",
		UserPoolClientId: "",
		UserPoolId: "",
		WebSocketUrl: ""
	});
	const {
		isUserAwsAccountConnected,
		setConnectFormValues,
		setIsUserAwsAccountConnected,
		clearCredentials,
		onLogin,
		validateFormValues
	} = useAmplifyAuth();
	const { resetStore: resetAwsStore } = useAws();
	const keyArr = Object.keys(formValues);

	const _onClose = () => {
		onClose();
		isUserAwsAccountConnected && window.location.reload();
	};

	const isBtnEnabled = useMemo(
		() => keyArr.filter(key => !!formValues[key as keyof typeof formValues]).length === keyArr.length,
		[formValues, keyArr]
	);

	const onChangeFormValues = (key: string, value: string) => {
		setFormValues({ ...formValues, [key as keyof ConnectFormValuesType]: value });
	};

	const onConnect = () => {
		const {
			IdentityPoolId: identityPoolId,
			UserPoolId: userPoolId,
			UserPoolClientId: userPoolWebClientId,
			UserDomain: domain,
			WebSocketUrl: webSocketUrl
		} = formValues;

		validateFormValues(
			identityPoolId,
			userPoolId,
			userPoolWebClientId,
			domain.slice(8),
			webSocketUrl,
			/* Success callback */
			() => {
				setConnectFormValues(formValues);
				clearCredentials();
				resetAwsStore();
				setIsUserAwsAccountConnected(true);
			}
		);
	};

	const _onLogin = async () => {
		onClose();
		await onLogin();
	};

	return (
		<Modal
			data-testid="connect-aws-account-modal-container"
			open={open}
			onClose={_onClose}
			className="connect-aws-account-modal"
			content={
				<Flex className="content-container">
					<Flex className="left-col">
						<View className="title-container">
							<IconAwsCloudFormation
								style={{ width: "4.31rem", height: "4.31rem", minWidth: "4.31rem", minHeight: "4.31rem" }}
							/>
							<TextEl
								fontFamily="AmazonEmber-Bold"
								fontSize="1.54rem"
								lineHeight="2.15rem"
								marginTop="0.46rem"
								text={TITLE}
							/>
						</View>
						<Text marginTop="0.62rem" variation="tertiary" textAlign="center" whiteSpace="pre-line">
							{TITLE_DESC}
						</Text>
						<View>
							<TextEl
								fontFamily="AmazonEmber-Bold"
								fontSize="1.23rem"
								lineHeight="1.85rem"
								marginTop="1.85rem"
								text={HOW_TO}
							/>
							<View marginTop="1.23rem">
								<Flex gap={0} marginBottom="1.85rem">
									<View className="step-number">
										<TextEl fontFamily="AmazonEmber-Bold" text="1" />
									</View>
									<View>
										<Flex gap={5}>
											<Text className="bold">
												<Link href={CF_TEMPLATE} target="_blank">
													Click here
												</Link>
												{STEP1}
											</Text>
										</Flex>
										<TextEl className="step-two-description" text={STEP1_DESC} />
									</View>
								</Flex>
								<Flex gap={0} marginBottom="1.85rem">
									<View className="step-number">
										<TextEl fontFamily="AmazonEmber-Bold" text="2" />
									</View>
									<View>
										<TextEl fontFamily="AmazonEmber-Bold" text={STEP2} />
										<Text className="step-two-description">
											{STEP2_DESC}
											<a href={HELP} target="_blank" rel="noreferrer">
												Learn more
											</a>
										</Text>
									</View>
								</Flex>
								<Flex gap={0}>
									<View className="step-number">
										<TextEl fontFamily="AmazonEmber-Bold" text="3" />
									</View>
									<View>
										<TextEl fontFamily="AmazonEmber-Bold" text={STEP3} />
										<TextEl className="step-two-description" text={STEP3_DESC} />
									</View>
								</Flex>
							</View>
						</View>
					</Flex>
					<Flex
						className="right-col"
						justifyContent={isUserAwsAccountConnected ? "center" : "flex-end"}
						textAlign={isUserAwsAccountConnected ? "center" : "left"}
					>
						{isUserAwsAccountConnected ? (
							<>
								<IconCheckMarkCircle className="icon-check-mark-circle" />
								<TextEl
									fontFamily="AmazonEmber-Bold"
									fontSize="1.54rem"
									lineHeight="2.15rem"
									marginTop="3.08rem"
									text={POST_CONNECT}
								/>
								<TextEl marginTop="1.23rem" variation="tertiary" whiteSpace="pre-line" text={POST_CONNECT_DESC} />
								{isUserAwsAccountConnected && (
									<Button
										marginTop="3.08rem"
										width="100%"
										height="3.08rem"
										variation="primary"
										fontFamily="AmazonEmber-Bold"
										onClick={_onLogin}
									>
										Sign in
									</Button>
								)}
								<Button className="continue-to-explore" width="100%" height="3.08rem" onClick={_onClose}>
									Continue to Demo
								</Button>
							</>
						) : (
							<>
								{keyArr.map((key, idx) => {
									return (
										<InputField
											dataTestId={`input-field-${idx}`}
											key={key}
											containerMargin="0rem 0rem 1.85rem 0rem"
											label={key}
											placeholder={`Enter ${key}`}
											value={formValues[key as keyof ConnectFormValuesType]}
											onChange={e => onChangeFormValues(key, e.target.value.trim())}
										/>
									);
								})}
								<Button
									data-testid="connect-button"
									variation="primary"
									width="100%"
									height="3.08rem"
									isDisabled={!isBtnEnabled}
									onClick={onConnect}
								>
									Connect
								</Button>
								<TextEl marginTop="0.62rem" text={AGREE} />
								<View onClick={() => window.open(AWS_TERMS_AND_CONDITIONS, "_blank")}>
									<TextEl className="hyperlink" fontFamily="AmazonEmber-Bold" text="Terms & Conditions" />
								</View>
							</>
						)}
					</Flex>
				</Flex>
			}
		/>
	);
};

export default ConnectAwsAccountModal;
