import * as dotenv from "dotenv";

import { askPlacesSecurityTests } from "./ask-places-security-test.js";
import { submitFeedbackSecurityTests } from "./submit-feedback-security-test.js";
// import { cognitoSecurityTests } from "./location-cognito-security-test.js";

dotenv.config();
export const main = async () => {
	await askPlacesSecurityTests();
	await submitFeedbackSecurityTests();
	// await locationCognitoSecurityTests();
};

main();
