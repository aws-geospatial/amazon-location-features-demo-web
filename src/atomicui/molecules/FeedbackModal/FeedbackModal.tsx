/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Alert, Button, Flex, Loader, SelectField, Text, View } from "@aws-amplify/ui-react";
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
	{ id: "NaturalLanguageSearch", label: "Natural Language Search" },
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

	const _onClose = () => {
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

	const onChangeFormRating = (rating: number) => {
		if (rating <= 5 && rating >= 0) {
			setFormValues({ ...formValues, rating: rating });
		}
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
		await submitFeedbackForm(category, rating, text, email);
		setIsSubmitting(false);
		clearForm();
		setShowAlert(true);
	};

	return (
		<Modal
			data-testid="feedback-modal-container"
			open={open}
			onClose={() => _onClose()}
			className="connect-aws-account-modal"
			content={
				<Flex className="content-container" ref={contentRef}>
					<Flex className="right-col" justifyContent={"center"} textAlign={"center"}>
						<View className="title-container">
							{showAlert ? (
								<Alert variation="success" isDismissible={true} onDismiss={() => dismissAlert()}>
									Feedback Submitted
								</Alert>
							) : (
								<></>
							)}
							<Text className="bold" fontSize="1.54rem" marginTop="0.46rem">
								Have Some Feedback For Us?
							</Text>
						</View>
						<Text
							marginTop="0.62rem"
							variation="tertiary"
							textAlign="center"
							whiteSpace="pre-line"
							className={isLtr ? "ltr" : "rtl"}
						>
							Let us know what you think of Amazon Location?
						</Text>
						<>
							<SelectField
								label="Category"
								style={{}}
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

							<InputField
								dataTestId={"input-field-feedback-rating"}
								containerMargin="0rem 0rem 1.85rem 0rem"
								label={"Rating*(1-5)"}
								placeholder={`${t("caam__enter.text")} ${"rating"}`}
								value={String(formValues.rating)}
								type="number"
								onChange={e => onChangeFormRating(Number(e.target.value.trim()))}
								name={"rating"}
							/>
							<InputField
								dataTestId={"input-field-feedback-text"}
								containerMargin="0rem 0rem 1.85rem 0rem"
								label={"Text*"}
								placeholder={`${t("caam__enter.text")} ${"Feedback"}`}
								value={formValues.text}
								onChange={e => onChangeFormValues("text", e.target.value)}
								name={"text"}
								type="text"
							/>
							<InputField
								dataTestId={"input-field-feedback-email"}
								containerMargin="0rem 0rem 1.85rem 0rem"
								label={"Email"}
								placeholder={`${t("caam__enter.text")} ${"email"}`}
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
								{isSubmitting ? <Loader /> : "Submit Feedback"}
							</Button>
						</>
					</Flex>
				</Flex>
			}
		/>
	);
};

export default FeedbackModal;
