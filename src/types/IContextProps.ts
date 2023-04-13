/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

import IActions from "./IActions";

export type IContextProps<TValues> = TValues & IActions<TValues>;
