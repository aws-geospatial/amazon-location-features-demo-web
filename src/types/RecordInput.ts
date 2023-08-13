import { Session } from "aws-sdk/clients/pinpoint";

import { EventTypeEnum } from "./Enums";

type RecordInput = {
	// AppPackageName?: string;
	// AppTitle?: string;
	// AppVersionCode?: string;
	Attributes?: {
		[key: string]: string;
	};
	// ClientSdkVersion?: string;
	EventType: EventTypeEnum;
	// EventType: string;
	// Metrics?: {
	// 	[key: string]: number;
	// };
	// SdkName?: string;
	Session?: Session;
	Timestamp?: string | undefined;
};

export default RecordInput;
