/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Alert, Button, Flex, Loader, SelectField, Text, TextAreaField, View } from "@aws-amplify/ui-react";
import { IconStar, IconStarFilled } from "@demo/assets";
import { Modal } from "@demo/atomicui/atoms";
import { InputField } from "@demo/atomicui/molecules";
import { useFeedback } from "@demo/hooks";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import { ConnectFormValuesType, FeedbackValueType } from "@demo/types";
import { isAndroid, isIOS } from "react-device-detect";
import { useTranslation } from "react-i18next";
import "./styles.scss";

const feedbackCategories = [
	{ id: "General", label: "General" },
	{ id: "Places", label: "Places" },
	{ id: "Maps", label: "Maps" },
	{ id: "Routes", label: "Routes" },
	{ id: "TrackingGeofencing", label: "Tracking & Geofencing" }
];

let scrollTimeout: NodeJS.Timer | undefined;

export interface FeedbackModalProps {
	open: boolean;
	onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ open, onClose }) => {
	const [formValues, setFormValues] = useState<FeedbackValueType>({
		category: feedbackCategories[0].id,
		rating: 0,
		text: "",
		email: ""
	});
	const [showAlert, setShowAlert] = useState(false);
	const { isSubmitting, setIsSubmitting, submitFeedbackForm } = useFeedback();
	const keyArr = Object.keys((({ text }) => ({ text }))(formValues));
	const { t, i18n } = useTranslation();
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

	const _onClose = () => {
		setShowAlert(false);
		clearForm();
		onClose();
	};

	const isBtnEnabled = useMemo(
		() =>
			keyArr.filter(key => !!formValues[key as keyof typeof formValues]).length === keyArr.length &&
			formValues.rating > 0,
		[formValues, keyArr]
	);

	const onChangeFormValues = (key: string, value?: string) => {
		setFormValues({ ...formValues, [key as keyof ConnectFormValuesType]: value });
	};

	const onChangeFormCategory = (value: string) => {
		setFormValues({ ...formValues, category: value });
	};

	const clearForm = () => {
		setFormValues({
			category: feedbackCategories[0].id,
			rating: 0,
			text: "",
			email: ""
		});
	};

	const dismissAlert = () => {
		setShowAlert(false);
	};

	const handleSubmit = async () => {
		const { category, rating, text, email } = formValues;
		setIsSubmitting(true);
		const response = await submitFeedbackForm(category, rating, text, email);
		if (response) {
			clearForm();
			setShowAlert(true);
		}
		setIsSubmitting(false);
	};

	const handleStarClick = (rating: number) => {
		setFormValues({ ...formValues, rating: rating });
	};

	return (
		<Modal
			data-testid="feedback-modal-container"
			open={open}
			onClose={() => _onClose()}
			hideCloseIcon={true}
			className="feedback-modal-container"
			style={{
				maxHeight: isDesktop ? (showAlert ? "56.62rem" : "54.62rem") : "100%"
			}}
			content={
				<Flex className="content-container" direction={"column"} alignContent={"center"} ref={contentRef}>
					<Flex direction={"column"} justifyContent={"center"} textAlign={"left"}>
						<View className="title-container">
							{showAlert ? (
								<Alert
									variation="success"
									isDismissible={true}
									onDismiss={() => dismissAlert()}
									style={{ borderRadius: "8px" }}
								>
									{t("fm__submit_feedback_alert.text")}
								</Alert>
							) : (
								<></>
							)}
							<Text
								className="bold"
								fontSize="1.54rem"
								marginTop="0.46rem"
								style={{ textAlign: "center", fontFamily: "" }}
							>
								{t("fm__header.text")}
							</Text>
						</View>
						<>
							<Text className="bold" margin={"0px 0px 0px 0px"} textAlign={"start"}>
								{t("fm__category.text")}
							</Text>
							<SelectField
								label="Category"
								labelHidden
								style={{
									background: "#F2F2F7",
									border: "1px solid var(--border-color-textfield)",
									borderRadius: "8px"
								}}
								value={formValues.category}
								onChange={e => onChangeFormCategory(e.target.value)}
							>
								{feedbackCategories.map(category => {
									return (
										<option key={category.id} value={category.id}>
											{category.label}
										</option>
									);
								})}
							</SelectField>

							<Text className="bold" margin={"0px 0px 0px 0px"} textAlign={"start"}>
								{t("fm__rating.text")}
							</Text>
							<Flex
								justifyContent="flex-start"
								alignItems="flex-start"
								alignContent="flex-start"
								direction="row"
								gap="1rem"
							>
								{[1, 2, 3, 4, 5].map(star => {
									return (
										<Flex
											key={star}
											onClick={() => handleStarClick(star)}
											style={{
												cursor: "pointer"
											}}
										>
											{star <= formValues.rating ? <IconStarFilled /> : <IconStar />}
										</Flex>
									);
								})}
							</Flex>

							<Text className="bold" margin={"0px 0px 0px 0px"} textAlign={"start"}>
								{t("fm__feedback_header.text")}
							</Text>
							<TextAreaField
								data-testid={"input-field-feedback-text"}
								label={""}
								placeholder={`${t("caam__enter.text")} ${t("fm__feedback_header.text")}`}
								rows={8}
								onChange={e => onChangeFormValues("text", e.target.value)}
								value={formValues.text}
								margin={"0rem 0rem 0.5rem 0rem"}
								labelHidden
								style={{
									background: "#F2F2F7",
									border: "1px solid var(--border-color-textfield)",
									borderRadius: "8px"
								}}
							/>
							<InputField
								dataTestId={"input-field-feedback-email"}
								containerMargin="0rem 0rem 1.85rem 0rem"
								label={`${t("fm__email_header.text")} (${t("fm__opt_header.text")})`}
								placeholder={`${t("caam__enter.text")} ${t("fm__email_header.text")}`}
								value={formValues.email}
								type="email"
								onChange={e => onChangeFormValues("email", e.target.value.trim())}
								name={"email"}
								autocomplete={"off"}
							/>
							<Button
								data-testid="connect-button"
								className="aws-connect-button"
								variation="primary"
								width="100%"
								height="3.08rem"
								isDisabled={isSubmitting ? true : !isBtnEnabled}
								onClick={() => handleSubmit()}
							>
								{isSubmitting ? <Loader /> : t("fm__submit_feedback_btn.text")}
							</Button>
							<Button
								data-testid="connect-button"
								className="aws-connect-button"
								variation="primary"
								width="100%"
								height="3.08rem"
								onClick={() => _onClose()}
								style={{
									backgroundColor: "white",
									color: "var(--amplify-components-text-color)",
									borderColor: "white",
									fontFamily: "AmazonEmber-Bold",
									fontSize: "14.0486px"
								}}
							>
								{isSubmitting ? <></> : t("confirmation_modal__cancel.text")}
							</Button>
						</>
					</Flex>
				</Flex>
			}
		/>
	);
};

export default FeedbackModal;
