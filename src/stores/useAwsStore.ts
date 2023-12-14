/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { IStateProps } from "@demo/types";
import Iot from "aws-sdk/clients/iot";
import Location from "aws-sdk/clients/location";

import createStore from "./createStore";

export interface AwsStoreProps {
	locationClient?: Location;
	iotClient?: Iot;
}

export const initialState: IStateProps<AwsStoreProps> = {};

export default createStore<AwsStoreProps>(initialState);
