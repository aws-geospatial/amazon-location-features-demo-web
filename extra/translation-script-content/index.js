import fs from "fs";
import path from "path";

import { Amplify, Auth } from "aws-amplify";
import AWS from "aws-sdk";

import * as dotenv from "dotenv";

import { excludedPhrases } from "./exclude-phrases.js";
import { excludedKeys } from "./excluded-keys.js";

dotenv.config({ path: "./.env" });

const region = process.env.AWS_REGION;
const identityPoolId = process.env.IDENTITY_POOL_ID;

Amplify.configure({
	Auth: {
		identityPoolId,
		region
	}
});

const fetchCredentials = async () => await Auth.currentUserCredentials();

const fixTranslation = (rawTranslation, targetLang) => {
	if (["ar", "he"].includes(targetLang) && rawTranslation.endsWith(".")) {
		return "\u002E" + rawTranslation.slice(0, rawTranslation.length - 1);
	}
	return rawTranslation; // no change
};

// Function to divide the JSON object into four parts
const divideJsonIntoBatches = json => {
	const keys = Object.keys(json);
	const batchSize = Math.ceil(keys.length / 16);
	const batches = [];
	for (let i = 0; i < keys.length; i += batchSize) {
		const batch = keys.slice(i, i + batchSize).reduce((obj, key) => {
			obj[key] = json[key];
			return obj;
		}, {});
		batches.push(batch);
	}
	return batches;
};

let credentials;
let translate;

const main = async () => {
	try {
		credentials = await fetchCredentials();
		translate = new AWS.Translate({
			credentials,
			region
		});

		const initCredsAndTranslate = async () => {
			credentials = await fetchCredentials();
			translate = new AWS.Translate({
				credentials,
				region
			});
		};

		const localesDirectory = "src/locales";
		const translationFilePath = `${localesDirectory}/en/en.json`;
		const languages = ["ar", "he", "es", "fr", "he", "hi", "it", "ja", "ko", "pt-BR", "zh-CN", "zh-TW"];
		const jsonFilePath = path.join("../../", translationFilePath);
		const json = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

		// Function to translate text
		const translateText = async (text, targetLang) => {
			if (excludedPhrases.includes(text)) {
				return text;
			}

			const params = {
				Text: text,
				SourceLanguageCode: "en",
				TargetLanguageCode: targetLang
			};

			try {
				const response = await translate.translateText(params).promise();
				return fixTranslation(response.TranslatedText, targetLang);
			} catch (error) {
				console.error("translateText()", { error });
				error?.code === "ExpiredTokenException" && initCredsAndTranslate();
			}
		};

		// Function to translate JSON
		const translateJson = async (json, targetLang) => {
			const translatedJson = {};

			for (const key in json) {
				// Check if key exists in the excluded-keys array
				if (excludedKeys.includes(key)) {
					translatedJson[key] = json[key]; // don't translate
				} else {
					translatedJson[key] = {
						text: await translateText(json[key].text, targetLang)
					};
				}
			}

			return translatedJson;
		};

		// Divide the JSON object into four batches
		const jsonBatches = divideJsonIntoBatches(json);

		// Translate all batches for each language before moving on to the next language
		for (const lang of languages) {
			for (let i = 0; i < jsonBatches.length; i++) {
				console.log(`Translating batch ${i + 1}/16 for language ${lang}.....`);
				const translatedJson = await translateJson(jsonBatches[i], lang);

				const dirPath = path.join("../../", `${localesDirectory}/${lang}`);
				const outputPath = path.join(dirPath, `${lang}.json`);

				// Ensure directory exists
				fs.mkdirSync(dirPath, { recursive: true });

				let existingJson = {};
				try {
					// Read existing language file if it exists
					existingJson = JSON.parse(fs.readFileSync(outputPath, "utf8"));
				} catch (error) {
					// If the file doesn't exist, continue to next batch
					console.log(`File for language ${lang} does not exist. Creating a new one...`);
				}

				const combinedJson = { ...existingJson, ...translatedJson };

				// Check if overwrite-{languageName}.json exists
				const overwriteFilePath = path.join(dirPath, `overwrite-${lang}.json`);
				if (fs.existsSync(overwriteFilePath)) {
					const overwriteJson = JSON.parse(fs.readFileSync(overwriteFilePath, "utf8"));
					// Overwrite the translations
					for (const key in overwriteJson) {
						if (combinedJson[key]) {
							combinedJson[key] = overwriteJson[key];
						}
					}
				}
				fs.writeFileSync(outputPath, JSON.stringify(combinedJson, null, 2));

				console.log(`Translation batch ${i + 1}/16 for the language ${lang} completed.`);
			}
		}
	} catch (error) {
		console.error("main()", { error });
	}
};

main();
