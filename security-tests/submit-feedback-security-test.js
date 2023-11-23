import https from "https";

import fetch from "node-fetch";

import { fail, pass } from "./utils.js";

export const submitFeedbackSecurityTests = async () => {
	console.log("----------------------------------------");
	console.log("PublicApp SubmitFeedback API Security Tests");
	console.log("----------------------------------------");

	const config = {
		baseUrl: process.env.VITE_NL_BASE_URL,
		apiKey: process.env.VITE_NL_API_KEY
	};

	await testSubmitFeedbackWithValidApiKey(config);
	await testSubmitFeedbackWithInvalidApiKey(config);
	await testSubmitFeedbackWithHttp(config);
	await testSubmitFeedbackWithTLS11(config);
	await testSubmitFeedbackWithTLS12(config);
};

const testSubmitFeedbackWithValidApiKey = async config => {
	console.log("Testing SubmitFeedback API with valid API Key");

	const response = await submitFeedback(config.baseUrl, config.apiKey);

	if (response.status === 200) {
		pass("SubmitFeedback API request authorized with valid API Key");
	} else {
		fail("SubmitFeedback API request not authorized with valid API Key");
	}
};

const testSubmitFeedbackWithInvalidApiKey = async config => {
	console.log("Testing SubmitFeedback API with invalid API Key");

	const response = await submitFeedback(config.baseUrl, "InvalidApiKey");

	if (response.status === 403) {
		pass("SubmitFeedback API request not authorized with invalid API Key");
	} else {
		fail("SubmitFeedback API not authorized with invalid API Key");
	}
};

const testSubmitFeedbackWithHttp = async config => {
	console.log("Testing SubmitFeedback API with HTTP method");
	const httpBaseUrl = config.baseUrl.replace("https:", "http:");

	let errorThrown = false;
	try {
		await submitFeedback(httpBaseUrl, config.apiKey);
		errorThrown = false;
	} catch (e) {
		errorThrown = true;
	}

	if (errorThrown === true) {
		pass("SubmitFeedback API request refused with HTTP method");
	} else {
		fail("SubmitFeedback API request allowed with HTTP method");
	}
};

const testSubmitFeedbackWithTLS11 = async config => {
	console.log("Testing SubmitFeedback API with TLS 1.1");

	const agent = new https.Agent({
		secureProtocol: "TLSv1_1_method"
	});

	let errorThrown = false;
	try {
		await submitFeedback(config.baseUrl, config.apiKey, agent);
		errorThrown = false;
	} catch (e) {
		errorThrown = true;
	}

	if (errorThrown === true) {
		pass("SubmitFeedback API request refused with TLS 1.1");
	} else {
		fail("SubmitFeedback API request allowed with TLS 1.1");
	}
};

const testSubmitFeedbackWithTLS12 = async config => {
	console.log("Testing SubmitFeedback API with TLS 1.2");

	const agent = new https.Agent({
		secureProtocol: "TLSv1_2_method"
	});

	try {
		await submitFeedback(config.baseUrl, config.apiKey, agent);
		pass("SubmitFeedback API request allowed with TLS 1.2");
	} catch (e) {
		console.log(e);
		fail("SubmitFeedback API request refused with TLS 1.2");
	}
};

const submitFeedback = async (baseUrl, apiKey, agent) => {
	return await fetch(`${baseUrl}/feedback/submit`, {
		method: "POST",
		headers: {
			"x-api-key": apiKey
		},
		body: JSON.stringify({
			category: "General",
			rating: 5,
			feedbackText: "This feedback was submitted by SubmitFeedbackSecurityTests"
		}),
		agent: agent
	});
};
