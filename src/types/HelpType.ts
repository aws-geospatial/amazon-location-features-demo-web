/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { HelpAccordionEnum } from "./Enums";

export type HelpAccordionType = {
	[HelpAccordionEnum.CREATE]: boolean;
	[HelpAccordionEnum.DELETE]: boolean;
	[HelpAccordionEnum.TROUBLESHOOT]: boolean;
};
