import { FC, RefObject } from "react";

import { Button, Card, Flex, Text } from "@aws-amplify/ui-react";
import { IconClose, IconGeofenceColor, IconTrackers } from "@demo/assets";
import useBottomSheet from "@demo/hooks/useBottomSheet";
import useDeviceMediaQuery from "@demo/hooks/useDeviceMediaQuery";
import { MenuItemEnum } from "@demo/types";
import { ResponsiveUIEnum } from "@demo/types/Enums";
import { useTranslation } from "react-i18next";
import "./styles.scss";

export interface NonStartUnauthSimulationProps {
	unauthSimulationCtaText: string;
	handleClose: () => void;
	handleCta: () => void;
	handleEnableLive: () => void;
	from: MenuItemEnum;
	startRef: RefObject<HTMLDivElement>;
}

const NonStartUnauthSimulation: FC<NonStartUnauthSimulationProps> = ({
	unauthSimulationCtaText,
	handleClose,
	from,
	handleCta,
	handleEnableLive,
	startRef
}) => {
	const { setUI } = useBottomSheet();
	const { t, i18n } = useTranslation();
	const currentLanguage = i18n.language;
	const { isDesktop } = useDeviceMediaQuery();

	return (
		<Card
			data-testid="unauth-simulation-card"
			className={`unauth-simulation-card ${!isDesktop ? "unauth-simulation-card-mobile" : ""}`}
			left={isDesktop ? 21 : 0}
			width={
				isDesktop
					? unauthSimulationCtaText.length > 42 || "ja" === currentLanguage
						? `${["pt-BR", "ja"].includes(currentLanguage) ? "37rem" : "31rem"}`
						: ""
					: "100%"
			}
			ref={startRef}
		>
			{isDesktop && (
				<Flex
					data-testid="unauth-simulation-card-header-close"
					className="unauth-simulation-card-header"
					onClick={() => {
						handleClose();
						setUI(ResponsiveUIEnum.explore);
					}}
				>
					<IconClose />
				</Flex>
			)}
			<Flex className="unauth-simulation-card-body" marginTop={!isDesktop ? "2.5rem" : 0}>
				<Flex direction={isDesktop ? "column" : "row"} alignItems={"center"} marginBottom={!isDesktop ? "1.5rem" : ""}>
					<Flex className="icon-container">
						{from === MenuItemEnum.GEOFENCE ? <IconGeofenceColor /> : <IconTrackers />}
					</Flex>
					<Flex direction="column" alignItems={isDesktop ? "center" : "flex-start"}>
						<Text className={`bold ${isDesktop ? "medium-text" : "regular-text"}`} marginTop="1.5rem">
							{from === MenuItemEnum.GEOFENCE ? t("geofences.text") : t("trackers.text")}
						</Text>
						<Text
							className="small-text"
							color="var(--grey-color)"
							textAlign={isDesktop ? "center" : "left"}
							marginTop={isDesktop ? "0.8rem" : "0"}
						>
							{from === MenuItemEnum.GEOFENCE
								? t("unauth_simulation__geofence_box_info.text")
								: t("unauth_simulation__tracker_box_info.text")}
						</Text>
					</Flex>
				</Flex>
				<Button
					data-testid="unauth-simulation-cta"
					variation="primary"
					marginTop="1.5rem"
					isFullWidth
					onClick={handleCta}
					fontFamily="AmazonEmber-Medium"
					fontSize="1.076rem"
					minHeight="3.076rem"
					textAlign={!isDesktop ? "center" : "left"}
				>
					{unauthSimulationCtaText}
				</Button>
			</Flex>
			<Flex className="unauth-simulation-card-footer">
				<Text
					data-testid="unauth-simulation-enable-live"
					className="small-text"
					color="var(--primary-color)"
					style={{ cursor: "pointer" }}
					onClick={handleEnableLive}
					fontFamily="AmazonEmber-Bold"
					fontSize="1rem"
				>{`${t("unauth_simulation__enable_live.text")} ${
					from === MenuItemEnum.GEOFENCE ? t("geofences.text") : t("trackers.text")
				}`}</Text>
				<Text fontSize="0.77rem" marginTop="0.08rem" color="var(--grey-color)">
					{t("unauth_simulation__disclaimer.text")}
				</Text>
			</Flex>
		</Card>
	);
};

export default NonStartUnauthSimulation;
