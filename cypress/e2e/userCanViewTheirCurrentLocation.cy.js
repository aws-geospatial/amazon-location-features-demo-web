/* Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved. */
/* SPDX-License-Identifier: MIT-0 */

const sel = '[class="maplibregl-user-location-dot maplibregl-marker maplibregl-marker-anchor-center"]';

describe("Current location", () => {
	it("CL-001 - should allow user to see their current location", { scrollBehavior: false }, () => {
		// TEMP DIAG, revert before merge: record the geolocate timeline across reloads and print it to the CI log.
		cy.on("window:before:load", win => {
			const diag = JSON.parse(win.sessionStorage.getItem("__diag") || "[]");
			const t0 = win.performance.now();
			const log = m => {
				diag.push(`${win.location.pathname} ${Math.round(win.performance.now() - t0)}ms ${m}`);
				win.sessionStorage.setItem("__diag", JSON.stringify(diag));
			};
			log("doc start");
			const geo = win.navigator.geolocation;
			const realGet = geo.getCurrentPosition.bind(geo);
			geo.getCurrentPosition = (ok, err, opts) => {
				const by = /maplibre/.test(new Error().stack) ? "maplibre" : "app";
				log(`getCurrentPosition by ${by}`);
				realGet(
					p => {
						log(`${by} position ok`);
						ok(p);
					},
					e => {
						log(`${by} position error ${e.code} ${e.message}`);
						err && err(e);
					},
					opts
				);
			};
			const realQuery = win.navigator.permissions.query.bind(win.navigator.permissions);
			win.navigator.permissions.query = d =>
				realQuery(d).then(r => {
					if (d && d.name === "geolocation") log(`permission geolocation=${r.state}`);
					return r;
				});
			for (const level of ["warn", "error"]) {
				const orig = win.console[level].bind(win.console);
				win.console[level] = (...a) => {
					log(`${level} ${a.map(String).join(" ").slice(0, 160)}`);
					orig(...a);
				};
			}
			new win.MutationObserver(() => {
				if (!win.__dot && win.document.querySelector(".maplibregl-user-location-dot")) {
					win.__dot = true;
					log(`dot in DOM: ${win.document.querySelector(".maplibregl-user-location-dot").className}`);
				}
			}).observe(win.document, { subtree: true, childList: true });
		});
		cy.visitDomain(`${Cypress.env("WEB_DOMAIN")}/demo`);
		cy.wait(15000);
		cy.window().then(win => {
			const btn = win.document.querySelector(".maplibregl-ctrl-geolocate");
			const tail = [
				`geolocate button: ${btn ? `${btn.className} disabled=${btn.disabled}` : "none"}`,
				`location-disabled icon shown: ${!!win.document.querySelector('.location-disabled[style*="flex"]')}`
			];
			const lines = JSON.parse(win.sessionStorage.getItem("__diag") || "[]").concat(tail);
			cy.task("log", `CL001 DIAG\n${lines.join("\n")}`);
		});
		cy.get(sel).should("be.visible");
	});
});
