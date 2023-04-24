import allureWriter from "@shelex/cypress-allure-plugin/writer";
import { defineConfig } from "cypress";
import { cypressBrowserPermissionsPlugin } from "cypress-browser-permissions";

export default defineConfig({
	viewportWidth: 1280,
	viewportHeight: 720,
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
				},
				/* Clear Cookies */
				clearCookies() {
					cy.getCookies().then(cookies => {
						cookies.forEach(cookie => {
							cy.clearCookie(cookie.name, { domain: cookie.domain });
						});
					});

					return null;
				}
			});

			// eslint-disable-next-line no-param-reassign
			config = cypressBrowserPermissionsPlugin(on, config);
			allureWriter(on, config);
			return config;
		},

		baseUrl: "https://qa.amazonlocation.services",
		specPattern: "./cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
		// supportFile: false,
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
