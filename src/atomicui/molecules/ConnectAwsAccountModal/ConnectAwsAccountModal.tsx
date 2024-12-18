/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button, Flex, Link, Text, View } from "@aws-amplify/ui-react";
import { IconAwsCloudFormation, IconCheckMarkCircle } from "@demo/assets/svgs";
import { DropdownEl, Modal } from "@demo/atomicui/atoms";
import { InputField } from "@demo/atomicui/molecules";
import { appConfig, regionsData } from "@demo/core/constants";
import { useAuth, useClient } from "@demo/hooks";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import { ConnectFormValuesType } from "@demo/types";
import { AnalyticsEventActionsEnum, EventTypeEnum, TriggeredByEnum } from "@demo/types/Enums";
import { record } from "@demo/utils/analyticsUtils";
import { isAndroid, isIOS } from "react-device-detect";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const {
	ROUTES: { HELP },
	LINKS: { AWS_TERMS_AND_CONDITIONS }
} = appConfig;
let scrollTimeout: NodeJS.Timer | undefined;

export interface ConnectAwsAccountModalProps {
	open: boolean;
	onClose: () => void;
}

const ConnectAwsAccountModal: FC<ConnectAwsAccountModalProps> = ({ open, onClose }) => {
	const [formValues, setFormValues] = useState<ConnectFormValuesType>({
		IdentityPoolId: "",
		UserDomain: "",
		UserPoolClientId: "",
		UserPoolId: "",
		WebSocketUrl: ""
	});
	const {
		userProvidedValues,
		setConnectFormValues,
		clearCredentials,
		onLogin,
		validateFormValues,
		stackRegion,
		cloudFormationLink,
		handleStackRegion
	} = useAuth();
	const { resetLocationAndIotClients } = useClient();
	const keyArr = Object.keys(formValues);
	const { t, i18n } = useTranslation();
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";
	const isOverflowing = ["de", "es", "fr", "it", "pt-BR"].includes(i18n.language);
	const { isDesktop, isDesktopBrowser } = useDeviceMediaQuery();
	const contentRef = useRef<HTMLDivElement | null>(null);

	const handleScroll = useCallback(() => {
		if (contentRef.current) {
			for (const key of Object.keys(formValues)) {
				const inputField = document.querySelector(`input[name=${key}]`) as HTMLInputElement;
				if (inputField) inputField.blur();
			}
		}
	}, [formValues]);

	useEffect(() => {
		if (!isDesktop && (isAndroid || isIOS) && open) {
			setTimeout(() => {
				const currentContentRef = contentRef.current;
				if (currentContentRef) currentContentRef.addEventListener("touchmove", handleScroll);

				return () => {
					if (currentContentRef) currentContentRef.removeEventListener("touchmove", handleScroll);
				};
			}, 500);
		}
	}, [handleScroll, isDesktop, isDesktopBrowser, contentRef, open]);

	useEffect(() => {
		if (isOverflowing) {
			const targetElement = document.getElementsByClassName("left-col")[0];

			window.addEventListener("wheel", () => {
				clearTimeout(scrollTimeout);

				// remove the hideScroll class while user is scrolling
				targetElement?.classList.remove("hideScroll");

				scrollTimeout = setTimeout(() => {
					// add the hideScroll class 1 second after user stops scrolling
					targetElement?.classList.add("hideScroll");
				}, 800);
			});
		}
	}, [open, isOverflowing]);

	const _onSelect = useCallback(
		(option: { value: string; label: string }) => {
			handleStackRegion(option);
		},
		[handleStackRegion]
	);

	const isBtnEnabled = useMemo(
		() => keyArr.filter(key => !!formValues[key as keyof typeof formValues]).length === keyArr.length,
		[formValues, keyArr]
	);

	const onChangeFormValues = (key: string, value: string) => {
		setFormValues({ ...formValues, [key as keyof ConnectFormValuesType]: value });
	};

	const onConnect = () => {
		const { IdentityPoolId: identityPoolId } = formValues;

		validateFormValues(
			identityPoolId,
			/* Success callback */
			() => {
				setConnectFormValues(formValues);
				clearCredentials();
				resetLocationAndIotClients();
			}
		);
	};

	const handleModalClose = () => {
		onClose();

		if (!userProvidedValues) {
			const columnsHavingText = Object.keys(formValues)
				.filter(key => !!formValues[key as keyof ConnectFormValuesType].trim())
				.map(valueKey => valueKey)
				.join(",");

			record(
				[
					{
						EventType: EventTypeEnum.AWS_ACCOUNT_CONNECTION_STOPPED,
						Attributes: {
							triggeredBy: TriggeredByEnum.CONNECT_AWS_ACCOUNT_MODAL,
							fieldsFilled: columnsHavingText,
							action: AnalyticsEventActionsEnum.MODAL_CLOSED
						}
					}
				],
				["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
			);
		}
	};

	return (
		<Modal
			data-testid="connect-aws-account-modal-container"
			open={open}
			onClose={handleModalClose}
			className="connect-aws-account-modal"
			content={
				<Flex className="content-container" ref={contentRef}>
					<Flex
						className="left-col"
						style={
							isDesktop
								? isOverflowing
									? {
											justifyContent: "none",
											overflowY: "auto",
											overflowX: "hidden"
									  }
									: { justifyContent: "center" }
								: userProvidedValues
								? { display: "none" }
								: {}
						}
					>
						<View className="title-container">
							<IconAwsCloudFormation
								style={{ width: "4.31rem", height: "4.31rem", minWidth: "4.31rem", minHeight: "4.31rem" }}
							/>
							<Text className="bold" fontSize="1.54rem" marginTop="0.46rem">
								{t("connect_aws_account.text")}
							</Text>
						</View>
						<Text
							marginTop="0.62rem"
							variation="tertiary"
							textAlign="center"
							whiteSpace="pre-line"
							className={isLtr ? "ltr" : "rtl"}
						>
							{t("caam__desc.text")}
						</Text>
						<View className="body">
							<Flex gap={0} justifyContent="flex-start" alignItems="center" marginTop="1rem">
								<Text className="bold" fontSize="1.08rem" order={isLtr ? 1 : 2} whiteSpace="nowrap">
									{t("caam__htct.text")}
								</Text>
								<Flex order={isLtr ? 2 : 1}>
									<DropdownEl
										defaultOption={stackRegion}
										options={regionsData}
										onSelect={_onSelect}
										showSelected
										width={!isDesktop ? "60%" : "80%"}
									/>
								</Flex>
							</Flex>
							<View marginTop="1.23rem">
								<Flex gap={0} marginBottom="1.85rem">
									<View
										className="step-number"
										margin={isLtr ? "0rem 1.23rem 0rem 0rem" : "0rem 0rem 0rem 1.23rem"}
										order={isLtr ? 1 : 2}
									>
										<Text className="bold">1</Text>
									</View>
									<View order={isLtr ? 2 : 1}>
										<Flex gap={5}>
											<Text className={`bold ${isLtr ? "ltr" : "rtl"}`}>
												<Link href={cloudFormationLink} target="_blank">
													{t("caam__click_here.text")}
												</Link>{" "}
												{t("caam__step_1__title.text")}
											</Text>
										</Flex>
										<Text className={`step-two-description ${isLtr ? "ltr" : "rtl"}`}>
											{t("caam__step_1__desc.text")}
										</Text>
									</View>
								</Flex>
								<Flex gap={0} marginBottom="1.85rem">
									<View
										className="step-number"
										margin={isLtr ? "0rem 1.23rem 0rem 0rem" : "0rem 0rem 0rem 1.23rem"}
										order={isLtr ? 1 : 2}
									>
										<Text className="bold">2</Text>
									</View>
									<View order={isLtr ? 2 : 1}>
										<Text className={`bold ${isLtr ? "ltr" : "rtl"}`}>{t("caam__step_2__title.text")}</Text>
										<Text className={`step-two-description ${isLtr ? "ltr" : "rtl"}`}>
											{t("caam__step_2__desc.text")}{" "}
											<a href={HELP} target="_blank" rel="noreferrer">
												{t("learn_more.text")}
											</a>
										</Text>
									</View>
								</Flex>
								<Flex gap={0}>
									<View
										className="step-number"
										margin={isLtr ? "0rem 1.23rem 0rem 0rem" : "0rem 0rem 0rem 1.23rem"}
										order={isLtr ? 1 : 2}
									>
										<Text className="bold">3</Text>
									</View>
									<View order={isLtr ? 2 : 1}>
										<Text className="bold" textAlign={isLtr ? "start" : "end"}>
											{t("caam__step_3__title.text")}
										</Text>
										<Text className="step-two-description" textAlign={isLtr ? "start" : "end"}>
											{t("caam__step_3__desc.text")}
										</Text>
									</View>
								</Flex>
							</View>
						</View>
					</Flex>
					<Flex
						className="right-col"
						justifyContent={userProvidedValues ? "center" : "flex-end"}
						textAlign={userProvidedValues ? "center" : "left"}
					>
						{userProvidedValues ? (
							<>
								<IconCheckMarkCircle className="icon-check-mark-circle" />
								<Text className="bold" fontSize="1.54rem" marginTop="3.08rem">
									{t("caam__post_connect__title.text")}
								</Text>
								<Text marginTop="1.23rem" variation="tertiary" whiteSpace="pre-line">
									{t("caam__post_connect__desc.text")}
								</Text>
								{userProvidedValues && (
									<Button
										data-testid="sign-in-button"
										marginTop="3.08rem"
										width="100%"
										height="3.08rem"
										variation="primary"
										fontFamily="AmazonEmber-Bold"
										onClick={() => {
											record(
												[
													{
														EventType: EventTypeEnum.SIGN_IN_STARTED,
														Attributes: { triggeredBy: TriggeredByEnum.CONNECT_AWS_ACCOUNT_MODAL }
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
								)}
								<Button
									data-testid="continue-to-explore"
									className="continue-to-explore"
									width="100%"
									height="3.08rem"
									onClick={() => {
										onClose();
										record(
											[
												{
													EventType: EventTypeEnum.CONTINUE_TO_DEMO_CLICKED,
													Attributes: { triggeredBy: TriggeredByEnum.CONNECT_AWS_ACCOUNT_MODAL }
												}
											],
											["userAWSAccountConnectionStatus", "userAuthenticationStatus"]
										);
									}}
								>
									{t("caam__continue_to_demo.text")}
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
											placeholder={`${t("caam__enter.text")} ${key}`}
											value={formValues[key as keyof ConnectFormValuesType]}
											onChange={e => onChangeFormValues(key, e.target.value.trim())}
											dir={langDir}
											name={key}
										/>
									);
								})}
								<Button
									data-testid="connect-button"
									className="aws-connect-button"
									variation="primary"
									width="100%"
									height="3.08rem"
									isDisabled={!isBtnEnabled}
									onClick={onConnect}
								>
									{t("caam__connect.text")}
								</Button>
								<Text marginTop="0.62rem">{t("caam__agree.text")}</Text>
								<View
									data-testid="terms-and-conditions"
									onClick={() => window.open(AWS_TERMS_AND_CONDITIONS, "_blank")}
								>
									<Text className="hyperlink" fontFamily="AmazonEmber-Bold">
										{t("t&c.text")}
									</Text>
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
