import { defineConfig } from "cypress";
import { onBeforeBrowserLaunch, modifyAndTransformPluginEnv } from "cypress-browser-permissions/plugin";
import { afterRunHook, beforeRunHook } from "cypress-mochawesome-reporter/lib";

export default defineConfig({
	defaultCommandTimeout: 20000,
	viewportWidth: 1440,
	viewportHeight: 733,
	retries: 2,
	video: false,
	experimentalMemoryManagement: true,
	env: {
		browserPermissions: {
			notifications: "allow",
			geolocation: "allow",
			popups: "allow"
		}
	},
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

			modifyAndTransformPluginEnv(config);

			on("before:browser:launch", (browser, launchOptions) => {
				onBeforeBrowserLaunch(config)(browser, launchOptions);
				if (browser.name === "chrome") {
					launchOptions.args.push("--enable-unsafe-swiftshader");
					console.log("Chrome args:", launchOptions.args.join(" "));
				}
				return launchOptions;
			});

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
		}
	}
});
