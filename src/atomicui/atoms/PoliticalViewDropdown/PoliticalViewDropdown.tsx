import { FC, useCallback, useEffect, useRef, useState } from "react";

import { Flex, Text } from "@aws-amplify/ui-react";
import { IconArrow } from "@demo/assets/svgs";
import { appConfig } from "@demo/core/constants";
import { useMap } from "@demo/hooks";
import { getFlagEmoji, isUserDeviceIsWin } from "@demo/utils";
import { useTranslation } from "react-i18next";
import "./styles.scss";
import { Tooltip } from "react-tooltip";

const {
	MAP_RESOURCES: { MAP_POLITICAL_VIEWS }
} = appConfig;

interface PoliticalViewDropdownProps {
	bordered?: boolean;
	arrowIconColor?: string;
	width?: string;
	disabled?: boolean;
}

const PoliticalViewDropdown: FC<PoliticalViewDropdownProps> = ({
	bordered = false,
	arrowIconColor,
	width = "100%",
	disabled = false
}) => {
	const [open, setOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { i18n, t } = useTranslation();
	const langDir = i18n.dir();
	const isLtr = langDir === "ltr";
	const { mapPoliticalView, setMapPoliticalView } = useMap();

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
		(option: { alpha2: string; alpha3: string; desc: string; isSupportedByPlaces: boolean }) => {
			setMapPoliticalView(option);
			setOpen(false);
		},
		[setMapPoliticalView]
	);

	return (
		<div ref={dropdownRef} className="dropdown-container" style={{ width }}>
			<div
				data-testid="dropdown-trigger-political-view"
				style={{ cursor: disabled ? "not-allowed" : "pointer", backgroundColor: disabled ? "#ddd" : "" }}
				className={bordered ? `trigger bordered dropdown-${open}` : "trigger"}
				onClick={() => !disabled && setOpen(!open)}
				data-tooltip-id="dropdown-trigger-political-view"
				data-tooltip-place="top"
				data-tooltip-content={t("political_view_satellite_disclaimer.text")}
			>
				<p data-testid="dropdown-label" className="dropdown-label" dir={langDir}>
					{!!mapPoliticalView.alpha3
						? `${mapPoliticalView.alpha3}: ${t(mapPoliticalView.desc)}`
						: t(mapPoliticalView.desc)}
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
			{disabled && <Tooltip id="dropdown-trigger-political-view" />}
			{open && (
				<ul data-testid="dropdown-options" className={bordered ? "options bordered" : "options"}>
					{MAP_POLITICAL_VIEWS.map(({ alpha2, alpha3, desc, isSupportedByPlaces }) => {
						return (
							<li
								data-testid={desc}
								key={desc}
								style={{ display: "flex", justifyContent: "start", direction: langDir }}
								onClick={() => handleClick({ alpha2, alpha3, desc, isSupportedByPlaces })}
							>
								<Flex gap={0} direction="column" padding="0.46rem 1.23rem">
									{!!alpha2 && !!alpha3 ? (
										<>
											<Flex gap={0}>
												{!isUserDeviceIsWin() && (
													<Flex gap={0} justifyContent="center" margin="0.07rem 0.3rem 0 0">
														{getFlagEmoji(alpha2)}
													</Flex>
												)}
												<Text className="bold small-text" color="var(--tertiary-color)">
													{alpha3}
												</Text>
											</Flex>
											<Text
												className="regular small-text"
												color="var(--grey-color-9)"
												textAlign={isLtr ? "left" : "right"}
											>
												{t(desc)}
											</Text>
										</>
									) : (
										<Text className="bold small-text" color="var(--tertiary-color)">
											{t(desc)}
										</Text>
									)}
								</Flex>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};

export default PoliticalViewDropdown;
