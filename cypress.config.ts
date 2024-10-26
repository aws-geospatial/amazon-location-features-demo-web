import { defineConfig } from "cypress";
import { cypressBrowserPermissionsPlugin } from "cypress-browser-permissions";
import { afterRunHook, beforeRunHook } from "cypress-mochawesome-reporter/lib";

export default defineConfig({
	defaultCommandTimeout: 20000,
	viewportWidth: 1440,
	viewportHeight: 733,
	retries: 3,
	video: false,
	experimentalMemoryManagement: true,
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

			on("before:run", async details => {
				console.log("override before:run");
				await beforeRunHook(details);
			});

			on("after:run", async () => {
				console.log("override after:run");
				await afterRunHook();
			});

			// eslint-disable-next-line no-param-reassign
			config = cypressBrowserPermissionsPlugin(on, config);
			return config;
		},
		specPattern: "./cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
		supportFile: "cypress/support/index.js",
		reporter: "cypress-mochawesome-reporter",
		reporterOptions: {
			reportDir: "cypress/reports",
			charts: true,
			reportPageTitle: "ALS E2E Report",
			embeddedScreenshots: true,
			inlineAssets: true
		},
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
