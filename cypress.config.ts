import { defineConfig } from "cypress";
import { cypressBrowserPermissionsPlugin } from "cypress-browser-permissions";

export default defineConfig({
	viewportWidth: 1024,
	viewportHeight: 733,
	env: {
		browserPermissions: {
			notifications: "allow",
			geolocation: "allow"
		}
	},
	chromeWebSecurity: false,
	e2e: {
		setupNodeEvents(on, config) {
			on("task", {
				/* Logging */
				log(message) {
					console.log(message);

					return null;
				}
			});

			// eslint-disable-next-line no-param-reassign
			config = cypressBrowserPermissionsPlugin(on, config);
			return config;
		},
		specPattern: "./cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
		supportFile: "cypress/support/index.js",
		chromeWebSecurity: false,
		env: {
			browserPermissions: {
				notifications: "allow",
				geolocation: "allow",
				camera: "block",
				microphone: "block",
				images: "allow",
				javascript: "allow",
				popups: "allow",
				plugins: "allow",
				cookies: "allow",
				chromeWebSecurity: false
			}
		}
	}
});
