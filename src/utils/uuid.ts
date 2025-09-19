/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

const uuid = {
	randomUUID: function () {
		const cryptoObj = (typeof self !== "undefined" && self.crypto) ? self.crypto : (typeof window !== "undefined" && window.crypto) ? window.crypto : undefined;

		if (cryptoObj && typeof cryptoObj.randomUUID === "function") {
			return cryptoObj.randomUUID();
		} else if (cryptoObj && typeof cryptoObj.getRandomValues === "function") {
			// generate a RFC4122 version 4 UUID using getRandomValues
			const bytes = new Uint8Array(16);
			cryptoObj.getRandomValues(bytes);
			// Set version bits (4) and reserved bits per RFC4122 (variant 1)
			bytes[6] = (bytes[6] & 0x0f) | 0x40;
			bytes[8] = (bytes[8] & 0x3f) | 0x80;
			const hex = Array.from(bytes, b => b.toString(16).padStart(2, "0"));
			return (
				hex.slice(0, 4).join("") + "-" +
				hex.slice(4, 6).join("") + "-" +
				hex.slice(6, 8).join("") + "-" +
				hex.slice(8, 10).join("") + "-" +
				hex.slice(10, 16).join("")
			);
		} else {
			throw new Error("No cryptographically secure random number generator available.");
		}
	},
	validateUUID: function (uuid: string) {
		return uuid.match("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");
	}
};

export { uuid };
