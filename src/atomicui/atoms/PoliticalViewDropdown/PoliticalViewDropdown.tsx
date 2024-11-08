import { FC, useCallback, useEffect, useRef, useState } from "react";

import { Flex, Text } from "@aws-amplify/ui-react";
import { IconArrow } from "@demo/assets/svgs";
import { SelectOption } from "@demo/types";
import { getFlagEmoji } from "@demo/utils";
import { useTranslation } from "react-i18next";
import "./styles.scss";

interface PoliticalViewDropdownProps {
	defaultOption?: SelectOption | SelectOption[];
	options: SelectOption[];
	onSelect: (option: SelectOption) => void;
	showSelected?: boolean;
	bordered?: boolean;
	arrowIconColor?: string;
	label?: string;
	width?: string;
	disabled?: boolean;
}

const PoliticalViewDropdown: FC<PoliticalViewDropdownProps> = ({
	defaultOption,
	options,
	onSelect,
	showSelected = false,
	bordered = false,
	arrowIconColor,
	label,
	width = "100%",
	disabled = false
}) => {
	const [open, setOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { t } = useTranslation();

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
			setOpen(false);
		},
		[onSelect]
	);

	return (
		<div ref={dropdownRef} className="dropdown-container" style={{ width }}>
			<div
				data-testid="dropdown-trigger"
				style={{ cursor: disabled ? "not-allowed" : "pointer", backgroundColor: disabled ? "#ddd" : "" }}
				className={bordered ? `trigger bordered dropdown-${open}` : "trigger"}
				onClick={() => !disabled && setOpen(!open)}
			>
				<p data-testid="dropdown-label" className="dropdown-label">
					{label?.split("-")[0] ||
						t((defaultOption as SelectOption)?.label.split("-")[0] as string) ||
						t("dropdown__placeholder.text")}
				</p>
				<IconArrow
					style={{
						transform: open ? "rotate(180deg)" : "rotate(0deg)",
						width: bordered ? "1rem" : "1.23rem",
						height: bordered ? "" : "1.23rem",
						fill: arrowIconColor ? arrowIconColor : "var(--primary-color)"
					}}
				/>
			</div>
			{open && (
				<ul data-testid="dropdown-options" className={bordered ? "options bordered" : "options"}>
					{options.map(option => (
						<li
							data-testid={option.value}
							key={option.value}
							className={showSelected && (defaultOption as SelectOption)?.value === option.value ? "selected" : ""}
							style={{ display: "flex", justifyContent: "start" }}
							onClick={() => handleClick(option)}
						>
							<Flex gap={0} direction="column" padding="0.46rem 1.23rem">
								<Flex gap={0}>
									<Flex gap={0} justifyContent="center" margin="0.07rem 0.3rem 0 0">
										{getFlagEmoji(option.value)}
									</Flex>
									<Text className="bold small-text" color="var(--tertiary-color)">
										{t(option.label).split("-")[0]}
									</Text>
								</Flex>
								<Text className="regular small-text" color="var(--grey-color-9)">
									{t(option.label).split("-")[1]}
								</Text>
							</Flex>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default PoliticalViewDropdown;
