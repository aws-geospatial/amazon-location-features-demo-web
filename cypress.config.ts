import { defineConfig } from "cypress";
import { cypressBrowserPermissionsPlugin } from 'cypress-browser-permissions'
import allureWriter from "@shelex/cypress-allure-plugin/writer"


export default defineConfig({
	viewportWidth: 1280,
    viewportHeight: 720,
	env: {
		browserPermissions: {
			notifications: "allow",
			geolocation: "allow",
		},
	},
	chromeWebSecurity: false,
	e2e: {
		setupNodeEvents(on, config) {
			config = cypressBrowserPermissionsPlugin(on, config)
			allureWriter(on, config);
			return config
		},

		baseUrl: "https://qa.amazonlocation.services",
		specPattern: "./cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
		// supportFile: false,
		"chromeWebSecurity": false,
		"env": {
			"browserPermissions": {
				"notifications": "allow",
				"geolocation": "allow",
				"camera": "block",
				"microphone": "block",
				"images": "allow",
				"javascript": "allow",
				"popups": "allow",
				"plugins": "allow",
				"cookies": "allow",
				"chromeWebSecurity": false,

			}
		}
	}
});
