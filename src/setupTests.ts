// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";
import { faker } from "@faker-js/faker";

if (typeof navigator?.clipboard?.writeText === "undefined") {
	Object.assign(navigator, { clipboard: { writeText: jest.fn() } });
}

if (typeof window.URL.createObjectURL === "undefined") {
	window.URL.createObjectURL = jest.fn();
}

if (typeof window?.crypto?.randomUUID === "undefined") {
	Object.assign(window, { crypto: { randomUUID: faker.datatype.uuid } });
}

if (typeof window?.matchMedia === "undefined") {
	Object.assign(window, {
		matchMedia: () => ({
			matches: true,
			addEventListener: jest.fn(),
			removeEventListener: jest.fn()
		})
	});
}
