/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, ReactNode, useCallback, useEffect, useRef, useState } from "react";

import { CheckboxField, Radio, RadioGroupField } from "@aws-amplify/ui-react";
import { IconArrow } from "@demo/assets/svgs";
import { SelectOption } from "@demo/types";
import { useTranslation } from "react-i18next";
import "./styles.scss";
export interface DropdownElProps {
	defaultOption?: SelectOption | SelectOption[];
	options: SelectOption[];
	onSelect: (option: SelectOption) => void;
	showSelected?: boolean;
	bordered?: boolean;
	isCheckbox?: boolean;
	isRadioBox?: boolean;
	arrowIconColor?: string;
	label?: string;
	width?: string;
	dataTestId?: string;
	triggerButton?: ReactNode;
}

const DropdownEl: FC<DropdownElProps> = ({
	defaultOption,
	options,
	onSelect,
	showSelected = false,
	bordered = false,
	isCheckbox = false,
	isRadioBox = false,
	arrowIconColor,
	label,
	width = "100%",
	dataTestId,
	triggerButton
}) => {
	const [open, setOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { t, i18n } = useTranslation();
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";

	const handleClickOutside = (event: MouseEvent) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
			setOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleClick = useCallback(
		(option: { value: string; label: string }) => {
			onSelect(option);
			if (!isCheckbox) setOpen(false);
		},
		[isCheckbox, onSelect]
	);

	return (
		<div data-testid={dataTestId} ref={dropdownRef} className="dropdown-container" style={{ width }}>
			<div
				data-testid="dropdown-trigger"
				className={
					bordered ? `trigger bordered dropdown-${open}` : `${isRadioBox ? "trigger dropdown-radioBox" : "trigger"}`
				}
				onClick={() => setOpen(!open)}
			>
				{triggerButton ? (
					<>{triggerButton}</>
				) : (
					<>
						<p data-testid="dropdown-label" className="dropdown-label">
							{label || t((defaultOption as SelectOption)?.label as string) || t("dropdown__placeholder.text")}
						</p>
						<IconArrow
							style={{
								transform: open ? "rotate(180deg)" : "rotate(0deg)",
								width: bordered ? "1rem" : "1.23rem",
								height: bordered ? "" : "1.23rem",
								fill: arrowIconColor ? arrowIconColor : "var(--black-color)"
							}}
						/>
					</>
				)}
			</div>
			{open && (
				<ul
					data-testid="dropdown-options"
					className={bordered ? "options bordered" : `${isRadioBox ? "options radioBox" : "options"}`}
				>
					{isRadioBox ? (
						<>
							{options.map((option, i) => (
								<li
									data-testid={option.value}
									key={i}
									style={{ display: "flex", justifyContent: isLtr ? "start" : "end" }}
									className="radio-li"
								>
									<RadioGroupField
										data-testid={`radiobox-${option.value}`}
										legend=""
										name="radioBox"
										defaultValue={(defaultOption as SelectOption)?.value}
										style={{ width: "100%", gap: 0 }}
										onChange={() => handleClick(option)}
									>
										<Radio
											className={`${isLtr ? "radio-option-end" : "radio-option"} ${
												(defaultOption as SelectOption)?.value === option.value ? "radio-option-selected" : ""
											}`}
											size="large"
											value={option.value}
											crossOrigin={undefined}
										>
											{option.label}
										</Radio>
									</RadioGroupField>
								</li>
							))}
						</>
					) : (
						<>
							{options.map(option => (
								<li
									data-testid={option.value}
									key={option.value}
									className={showSelected && (defaultOption as SelectOption)?.value === option.value ? "selected" : ""}
									style={{ display: "flex", justifyContent: isLtr ? "start" : "end" }}
									onClick={() => !isCheckbox && handleClick(option)}
									dir={langDir}
								>
									{isCheckbox ? (
										<CheckboxField
											data-testid={`checkbox-${option.value}`}
											className="option-checkbox"
											label={option.label}
											name={option.value}
											value={option.value}
											size="large"
											checked={(defaultOption as SelectOption[]).some(
												(item: SelectOption) => item.value === option.value
											)}
											crossOrigin={undefined}
											onChange={() => handleClick(option)}
										/>
									) : (
										<span className="option-checkbox">{t(option.label)}</span>
									)}
								</li>
							))}
						</>
					)}
				</ul>
			)}
		</div>
	);
};

export default DropdownEl;
