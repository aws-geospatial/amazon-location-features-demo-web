/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

const uuid = {
	randomUUID: function () {
		const {
			crypto: { randomUUID }
		} = self;

		if (typeof randomUUID !== "undefined") {
			return self.crypto.randomUUID();
		} else {
			return Date.now().toString(36) + Math.random().toString(36).substring(2);
		}
	},
	validateUUID: function (uuid: string) {
		return uuid.match("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");
	}
};

export { uuid };
