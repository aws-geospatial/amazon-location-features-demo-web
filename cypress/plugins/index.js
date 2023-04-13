/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
/// <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 */

const { cypressBrowserPermissionsPlugin } = require("cypress-browser-permissions");

module.exports = (on, config) => {
	// eslint-disable-next-line no-param-reassign
	config = cypressBrowserPermissionsPlugin(on, config);
	return config;
};
