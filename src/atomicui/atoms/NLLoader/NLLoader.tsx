/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useEffect, useState } from "react";

import { Loader as AmplifyLoader, Flex } from "@aws-amplify/ui-react";
import { useTranslation } from "react-i18next";

interface NLLoaderProps {
	nlLoadText: string[];
}
const NLLoader: React.FC<NLLoaderProps> = ({ nlLoadText }) => {
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
			style={{
				flexDirection: "column"
			}}
		>
			<Flex
				style={{
					fontSize: "12px"
				}}
			>
				<AmplifyLoader size="large" />
				{t(nlLoadText[loaderIdx] as string)}
			</Flex>
		</Flex>
	);
};

export default NLLoader;
