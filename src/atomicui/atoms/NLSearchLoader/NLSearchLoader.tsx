/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useEffect, useState } from "react";

import { Loader as AmplifyLoader, Flex } from "@aws-amplify/ui-react";
import { useTranslation } from "react-i18next";

interface NLSearchLoaderProps {
	nlLoadText: string[];
}
const NLSearchLoader: React.FC<NLSearchLoaderProps> = ({ nlLoadText }) => {
	const [loaderIdx, setloaderIdx] = useState(0);
	const { t } = useTranslation();

	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout>;
		if (loaderIdx < nlLoadText.length - 1) {
			timeout = setTimeout(() => setloaderIdx(loaderIdx + 1), 3500);
		}

		return () => {
			clearTimeout(timeout);
		};
	}, [nlLoadText, loaderIdx]);

	return (
		<Flex
			gap={0}
			width="100%"
			height="100%"
			data-testid="nl-loader-container"
			style={{
				flexDirection: "column"
			}}
		>
			<Flex
				style={{
					fontSize: "12px"
				}}
			>
				<AmplifyLoader data-testid="nl-loader" size="large" />
				<Flex data-testid="nl-loader-message">{t(nlLoadText[loaderIdx] as string)}</Flex>
			</Flex>
		</Flex>
	);
};

export default NLSearchLoader;
