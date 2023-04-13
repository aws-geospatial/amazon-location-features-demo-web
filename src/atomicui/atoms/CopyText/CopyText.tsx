/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import React, { useState } from "react";

import { IconCopy, IconTickCircle } from "@demo/assets";
import "./styles.scss";

interface CopyTextProps {
	text: string;
	iconSize?: number;
	copyIconColor?: string;
	tickIconColor?: string;
}

const CopyText = React.forwardRef<HTMLSpanElement | null, CopyTextProps>(
	({ text, iconSize = 18, copyIconColor = "var(--grey-light-color)", tickIconColor = "var(--green-color)" }, ref) => {
		const [isCopied, setIsCopied] = useState<boolean>(false);

		const handleClick = () => {
			navigator.clipboard.writeText(text);
			setIsCopied(true);
			setTimeout(() => {
				setIsCopied(false);
			}, 2500);
		};

		return (
			<span className="copy-text-container" ref={ref} onClick={handleClick}>
				{isCopied ? (
					<IconTickCircle width={iconSize} height={iconSize} fill={tickIconColor} />
				) : (
					<IconCopy width={iconSize} height={iconSize} fill={copyIconColor} />
				)}
			</span>
		);
	}
);

export default CopyText;
