const fs = require("fs");
const path = require("path");

const rootLibDir = "demo-app-lib";
const newLibPath = path.join(rootLibDir, "lib");
const oldLibPath = "lib";

function transformPackageJson(originalPackageJson) {
	const { version, main, module, types, exports } = originalPackageJson;

	return {
		name: "demo-app-lib",
		version,
		main,
		module,
		types,
		exports,
		peerDependencies: {
			"@aws-amplify/ui-react": "^6.9.1",
			"aws-amplify": "^6.13.1",
			i18next: "^23.2.8",
			"i18next-browser-languagedetector": "^7.1.0",
			ramda: "^0.28.0",
			react: "^18.2.0",
			"react-device-detect": "^2.2.3",
			"react-dom": "^18.2.0",
			"react-i18next": "^13.0.1",
			"react-router-dom": "^6.4.3",
			"react-spring-bottom-sheet": "3.5.0-alpha.0",
			"react-toastify": "^9.1.1",
			"react-tooltip": "^5.10.0"
		}
	};
}

function main() {
	try {
		// Cleaning up existing demo-app-lib directory...
		console.log("Cleaning up existing demo-app-lib directory...");
		if (fs.existsSync(rootLibDir)) {
			fs.rmSync(rootLibDir, { recursive: true, force: true });
		}

		fs.mkdirSync(newLibPath, { recursive: true });

		if (fs.existsSync(oldLibPath)) {
			fs.readdirSync(oldLibPath).forEach(file => {
				const filePath = path.join(oldLibPath, file);
				const newFilePath = path.join(newLibPath, file);
				fs.renameSync(filePath, newFilePath);
			});
		}

		// Modifying package.json for demo-app-lib...
		console.log("Modifying package.json for demo-app-lib...");
		const originalPackageJson = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf-8"));
		const modifiedPackageJson = transformPackageJson(originalPackageJson);
		fs.writeFileSync(path.join(path.resolve(rootLibDir), "package.json"), JSON.stringify(modifiedPackageJson, null, 2));

		// Cleaning up old lib directory...
		console.log("Cleaning up old lib directory...");
		fs.rmSync(oldLibPath, { recursive: true, force: true });

		console.log("Created demo-app-lib prepared successfully.");
	} catch (error) {
		console.error("Failed to prepare local lib:", error);
	}
}

main();
