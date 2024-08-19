/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { FC, ReactNode } from "react";

import { ThemeProvider } from "@aws-amplify/ui-react";
import { appTheme } from "@demo/theme";

import "@aws-amplify/ui-react/styles.css";
import "react-toastify/dist/ReactToastify.min.css";
import "@demo/theme/appStyles.scss";
import "react-tooltip/dist/react-tooltip.css";
import "maplibre-gl/dist/maplibre-gl.css";

interface AppWrapperProps {
	children?: ReactNode;
}

const AppWrapper: FC<AppWrapperProps> = ({ children }) => (
	<ThemeProvider theme={appTheme} nonce="dAnIsRazNonCe">
		{children}
	</ThemeProvider>
);

export default AppWrapper;
