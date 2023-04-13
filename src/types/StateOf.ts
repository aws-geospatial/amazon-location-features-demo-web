/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import { Context, ContextType } from "react";

import { IContextProps } from "@demo/types";

import KeysOfPropsOfType from "./KeysOfPropsOfType";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StateOf<T> = Omit<T, KeysOfPropsOfType<T, (...args: any[]) => any>>;

export type IStateProps<TValues> = StateOf<ContextType<Context<IContextProps<TValues>>>>;
