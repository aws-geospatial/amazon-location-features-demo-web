/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

export default interface IActions<T> {
	setState: (state: T | ((state: T) => T)) => void;
}
