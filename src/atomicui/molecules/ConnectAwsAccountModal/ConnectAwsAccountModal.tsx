/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useEffect, useMemo, useState } from "react";

import { Button, Flex, Link, Text, View } from "@aws-amplify/ui-react";
import { IconAwsCloudFormation, IconCheckMarkCircle } from "@demo/assets";
import { DropdownEl, Modal, TextEl } from "@demo/atomicui/atoms";
import { InputField } from "@demo/atomicui/molecules";
import { appConfig, connectAwsAccountData } from "@demo/core/constants";
import { useAmplifyAuth, useAmplifyMap, useAws } from "@demo/hooks";
import { ConnectFormValuesType, EsriMapEnum, MapProviderEnum } from "@demo/types";
import "./styles.scss";
import { transformCloudFormationLink } from "@demo/utils/transformCloudFormationLink";

const {
	ENV: { CF_TEMPLATE, REGION, REGION_ASIA },
	ROUTES: { HELP },
	MAP_RESOURCES: { GRAB_SUPPORTED_AWS_REGIONS },
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
	POST_CONNECT_DESC,
	OPTIONS
} = connectAwsAccountData;
const defaultRegion = OPTIONS.find(option => option.value === REGION) as { value: string; label: string };
const defaultRegionAsia = OPTIONS.find(option => option.value === REGION_ASIA) as { value: string; label: string };

interface ConnectAwsAccountModalProps {
	open: boolean;
	onClose: () => void;
	handleCurrentLocationAndViewpoint: (b: boolean) => void;
}

const ConnectAwsAccountModal: React.FC<ConnectAwsAccountModalProps> = ({
	open,
	onClose,
	handleCurrentLocationAndViewpoint
}) => {
	const [formValues, setFormValues] = useState<ConnectFormValuesType>({
		IdentityPoolId: "",
		UserDomain: "",
		UserPoolClientId: "",
		UserPoolId: "",
		WebSocketUrl: ""
	});
	const [cloudFormationLink, setCloudFormationLink] = useState(CF_TEMPLATE);
	const [stackRegion, setStackRegion] = useState<{ value: string; label: string }>(defaultRegion);
	const {
		isUserAwsAccountConnected,
		setConnectFormValues,
		setIsUserAwsAccountConnected,
		clearCredentials,
		onLogin,
		validateFormValues
	} = useAmplifyAuth();
	const { resetStore: resetAwsStore } = useAws();
	const { mapProvider: currentMapProvider, setMapProvider, setMapStyle } = useAmplifyMap();
	const keyArr = Object.keys(formValues);

	useEffect(() => {
		if (currentMapProvider === MapProviderEnum.GRAB) {
			const newUrl = transformCloudFormationLink(REGION_ASIA);
			setCloudFormationLink(newUrl);
			setStackRegion(defaultRegionAsia);
		}
	}, [currentMapProvider]);

	const _onClose = () => {
		onClose();
		isUserAwsAccountConnected && window.location.reload();
	};

	const _onSelect = (option: { value: string; label: string }) => {
		const newUrl = transformCloudFormationLink(option.value);
		setCloudFormationLink(newUrl);
		setStackRegion(option);
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
				if (
					currentMapProvider === MapProviderEnum.GRAB &&
					!GRAB_SUPPORTED_AWS_REGIONS.includes(identityPoolId.split(":")[0])
				) {
					setMapProvider(MapProviderEnum.ESRI);
					setMapStyle(EsriMapEnum.ESRI_LIGHT);
					handleCurrentLocationAndViewpoint(false);
				}

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
							<Flex gap={0} justifyContent="flex-start" alignItems="center" marginTop="1rem">
								<Text className="bold" fontSize="1.08rem">
									{HOW_TO}
								</Text>
								<DropdownEl defaultOption={stackRegion} options={OPTIONS} onSelect={_onSelect} showSelected />
							</Flex>
							<View marginTop="1.23rem">
								<Flex gap={0} marginBottom="1.85rem">
									<View className="step-number">
										<TextEl fontFamily="AmazonEmber-Bold" text="1" />
									</View>
									<View>
										<Flex gap={5}>
											<Text className="bold">
												<Link href={cloudFormationLink} target="_blank">
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
