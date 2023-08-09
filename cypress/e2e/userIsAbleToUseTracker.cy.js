/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */
import { faker } from "@faker-js/faker";

describe("Tracker", () => {
	const geofenceName = faker.random.word();

	beforeEach(() => {
		cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
		cy.get('[id="Icon"]').click();
		cy.wait(2000);
		cy.contains("Settings").click();
		cy.wait(2000);
		cy.contains("Connect AWS Account").click();
		cy.wait(2000);
		cy.get('[placeholder="Enter IdentityPoolId"]').type(`${Cypress.env("IDENTITY_POOL_ID")}`);
		cy.get('[placeholder="Enter UserDomain"]').type(`${Cypress.env("USER_DOMAIN")}`);
		cy.get('[placeholder="Enter UserPoolClientId"]').type(`${Cypress.env("USER_POOL_CLIENT_ID")}`);
		cy.get('[placeholder="Enter UserPoolId"]').type(`${Cypress.env("USER_POOL_ID")}`);
		cy.get('[placeholder="Enter WebSocketUrl"]').type(`${Cypress.env("WEB_SOCKET_URL")}`);
		cy.get('[type="button"]').eq(3).click();
		cy.wait(5000);
		cy.contains("Connect AWS Account").click();
		cy.wait(2000);
		cy.get('[type="button"]').eq(3).click();
		cy.wait(2000);
		cy.origin(`${Cypress.env("USER_DOMAIN")}`, () => {
			cy.get(".modal-content.background-customizable.modal-content-mobile.visible-md.visible-lg").then(els => {
				[...els].forEach(el => {
					cy.wrap(el)
						.get('[placeholder="Username"]')
						.eq(1)
						.type(`${Cypress.env("COGNITO_EMAIL")}`);
					cy.wrap(el)
						.get('[placeholder="Password"]')
						.eq(1)
						.type(`${Cypress.env("COGNITO_PASSWORD")}`);
					cy.wrap(el).get('[name="signInSubmitButton"]').eq(1).click();
				});
			});
		});
		cy.wait(5000);

		cy.get('[id="Icon"]').click();
		cy.wait(2000);

		cy.get("#root").then($root => {
			const asd = $root.find('[class="amplify-button amplify-field-group__control amplify-button--primary"]');

			if (asd.length && asd[0].innerText === "Sign in") {
				asd[0].click();
			} else {
				cy.get('[id="Icon"]').click();
			}
		});

		cy.wait(7000);
	});

	it("should allow user to add a tracker and the user should see the notifications for Geofence enter and exit events", () => {
		cy.get('[id="Icon"]').click();
		cy.wait(2000);

		cy.contains("Tracker").click();
		cy.wait(2000);

		cy.contains("Continue").click();
		cy.wait(2000);

		cy.get('[class="amplify-flex geofence-button"]').click();
		cy.wait(4000);

		cy.get('[placeholder="Enter address or coordinates"]').type("Rio Tinto Perth Western Australia");
		cy.wait(4000);
		cy.contains("Rio Tinto Operations Centre").click();
		cy.wait(2000);
		cy.get('[placeholder="Type unique Geofence Name"]').type(`${geofenceName}`);
		cy.wait(2000);
		cy.contains("Save").click();
		cy.wait(2000);
		cy.get("div").should("contain", `${geofenceName}`);
		cy.wait(1000);
		cy.get('[class="amplify-flex geofence-card-close"]').click();
		cy.wait(500);

		cy.get('[class="mapboxgl-canvas"]').click("left", { force: true });
		cy.wait(2000);
		cy.get('[class="mapboxgl-canvas"]').click("right", { force: true });
		cy.wait(2000);
		cy.get('[class="mapboxgl-canvas"]').click("right", { force: true });
		cy.wait(2000);

		cy.contains("Save").click();
		cy.wait(2000);

		cy.get('[class="amplify-button amplify-field-group__control amplify-button--primary play-pause-button"]').click();
		cy.wait(2000);

		cy.get(
			'[class="Toastify__toast Toastify__toast-theme--dark Toastify__toast--info Toastify__toast--close-on-click enter-geofence"]',
			{ timeout: 50000 }
		)
			.should("be.visible")
			.click({ multiple: true });

		cy.get(
			'[class="Toastify__toast Toastify__toast-theme--dark Toastify__toast--info Toastify__toast--close-on-click exit-geofence"]',
			{ timeout: 50000 }
		)
			.should("be.visible")
			.click({ multiple: true });

		cy.wait(2000);
	});

	it("should allow user to add a tracker for car and be able to edit", () => {
		cy.wait(5000);
		cy.get('[placeholder="Search"]').click();
		cy.wait(2000);
		cy.get('[inputmode="search"]')
			.type("gramercy park music school USA")
			.wait(5000)
			.type("{downArrow}")
			.type("{enter}");
		cy.wait(2000);

		cy.get('[id="Icon"]').click();
		cy.wait(2000);

		cy.contains("Tracker").click();
		cy.wait(2000);

		cy.contains("Continue").click();
		cy.wait(2000);

		cy.get('[class="mapboxgl-canvas"]').click("left", { force: true });
		cy.wait(2000);
		cy.get('[class="mapboxgl-canvas"]').click("right", { force: true });
		cy.wait(2000);
		cy.contains("Save").click();
		cy.wait(2000);
		cy.contains("Edit").click();
		cy.wait(2000);
		cy.get("div").should("contain", "Clear");
		cy.get("div").should("contain", "Save");
		cy.contains("Save").click();
		cy.wait(2000);
		cy.contains("Simulate").click();
		cy.wait(2000);
		cy.get("div").should("contain", "Pause");
		cy.get('[class="amplify-flex tracking-card-close"]').click();
	});

	// it("should allow user to add a tracker for walk", () => {
	// 	cy.get('[class="icon-container"]').eq(0).click();
	// 	cy.wait(2000);
	// 	cy.get('[class="mapboxgl-canvas"]').click("left");
	// 	cy.wait(2000);
	// 	cy.get('[class="mapboxgl-canvas"]').click("right");
	// 	cy.wait(2000);
	// 	cy.contains("Save").click();
	// 	cy.wait(2000);
	// 	cy.contains("Simulate").click();
	// 	cy.wait(2000);
	// 	cy.get("div").should("contain", "Pause");
	// 	cy.get('[class="amplify-flex tracking-card-close"]').click();
	// 	cy.get('[id="Icon"]').click();
	// 	cy.contains("Sign out").click();
	// 	cy.wait(5000);
	// });

	// it("should allow user to add a tracker for drone", () => {
	// 	cy.get('[class="icon-container"]').eq(1).click();
	// 	cy.wait(2000);
	// 	cy.get('[class="mapboxgl-canvas"]').click("left");
	// 	cy.wait(2000);
	// 	cy.get('[class="mapboxgl-canvas"]').click("right");
	// 	cy.wait(2000);
	// 	cy.contains("Save").click();
	// 	cy.wait(2000);
	// 	cy.contains("Simulate").click();
	// 	cy.wait(5000);
	// 	cy.get("div").should("contain", "Pause");
	// 	cy.get('[class="amplify-flex tracking-card-close"]').click();
	// 	cy.get('[id="Icon"]').click();
	// 	cy.contains("Sign out").click();
	// 	cy.wait(5000);
	// });
});
