/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { IStateProps } from "@demo/types";
import { Iot, Location } from "aws-sdk";

import createStore from "./createStore";

export interface AwsStoreProps {
	locationClient?: Location;
	iotClient?: Iot;
}

export const initialState: IStateProps<AwsStoreProps> = {};

export default createStore<AwsStoreProps>(initialState);
