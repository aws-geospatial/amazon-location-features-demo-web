import fetch from "node-fetch";
import https from "https";
import { fail, pass } from "./utils.js";

export const askPlacesSecurityTests = async () => {
  console.log("----------------------------------------");
  console.log("PublicApp AskPlaces API Security Tests");
  console.log("----------------------------------------");

  const config = {
    baseUrl: process.env.VITE_NL_BASE_URL,
    apiKey: process.env.VITE_NL_API_KEY
  };

  await testAskPlacesWithValidApiKey(config);
  await testAskPlacesWithInvalidApiKey(config);
  await testAskPlacesWithHttp(config);
  await testAskPlacesWithTLS11(config);
  await testAskPlacesWithTLS12(config);
};

const testAskPlacesWithValidApiKey = async (config) => {
  console.log("Testing AskPlaces API with valid API Key");

  const response = await askPlaces(config.baseUrl, config.apiKey);

  if (response.status === 200) {
    pass("AskPlaces API request authorized with valid API Key");
  } else {
    fail("AskPlaces API request not authorized with valid API Key");
  }
};

const testAskPlacesWithInvalidApiKey = async (config) => {
  console.log("Testing AskPlaces API with invalid API Key");

  const response = await askPlaces(config.baseUrl, "InvalidApiKey");

  if (response.status === 403) {
    pass("AskPlaces API request not authorized with invalid API Key");
  } else {
    fail("AskPlaces API not authorized with invalid API Key");
  }
};

const testAskPlacesWithHttp = async (config) => {
  console.log("Testing AskPlaces API with HTTP method");
  const httpBaseUrl = config.baseUrl.replace("https:", "http:");

  let errorThrown = false;
  try {
    await askPlaces(httpBaseUrl, config.apiKey);
    errorThrown = false;
  } catch (e) {
    errorThrown = true;
  }

  if (errorThrown === true) {
    pass("AskPlaces API request refused with HTTP method");
  } else {
    fail("AskPlaces API request allowed with HTTP method");
  }
};

const testAskPlacesWithTLS11 = async (config) => {
  console.log("Testing AskPlaces API with TLS 1.1");

  const agent = new https.Agent({
    secureProtocol: "TLSv1_1_method"
  });

  let errorThrown = false;
  try {
    await askPlaces(config.baseUrl, config.apiKey, agent);
    errorThrown = false;
  } catch (e) {
    errorThrown = true;
  }

  if (errorThrown === true) {
    pass("AskPlaces API request refused with TLS 1.1");
  } else {
    fail("AskPlaces API request allowed with TLS 1.1");
  }
};

const testAskPlacesWithTLS12 = async (config) => {
  console.log("Testing AskPlaces API with TLS 1.2");

  const agent = new https.Agent({
    secureProtocol: "TLSv1_2_method"
  });

  try {
    await askPlaces(config.baseUrl, config.apiKey, agent);
    pass("AskPlaces API request allowed with TLS 1.2");
  } catch (e) {
    console.log(e);
    fail("AskPlaces API request refused with TLS 1.2");
  }
};

const askPlaces = async (baseUrl, apiKey, agent) => {
  return await fetch(`${baseUrl}/places/ask?` + new URLSearchParams({ Text: "Coffee Shop" }), {
    method: "GET",
    headers: {
      "x-api-key": apiKey
    },
    agent: agent
  });
};
