/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC } from "react";

import { Flex, View, ViewProps } from "@aws-amplify/ui-react";
import { LogoSmall } from "@demo/assets";
import { useTranslation } from "react-i18next";
import "./styles.scss";

interface LogoProps extends ViewProps {
	onClick?: () => void;
}

const Logo: FC<LogoProps> = ({ onClick, ...props }) => {
	const { t } = useTranslation();

	return (
		<View
			data-testid="logo-container"
			className="site-logo__container"
			as={Flex}
			alignItems="center"
			gap={0}
			onClick={onClick}
			{...props}
		>
			<LogoSmall className="is__logo" width="32pt" height="24pt" />
			<span className="heading">{t("al.text")}</span>
		</View>
	);
};

export default Logo;
