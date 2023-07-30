const fs = require("fs");
const path = require("path");

const rootLibDir = "demo-app-lib";
const newLibPath = `${rootLibDir}/lib`;
const oldLibPath = "lib";
const packageJsonPath = "package.json";

function main() {
	try {
		// Remove the existing repository directory, if it exists
		console.log("Removing existing lib directory, if it exists...");
		if (fs.existsSync(rootLibDir)) {
			fs.rmSync(rootLibDir, { recursive: true, force: true });
			console.log("Existing directory removed.");
		} else {
			console.log("Directory not found.");
		}

		fs.mkdirSync(rootLibDir);
		fs.mkdirSync(newLibPath);

		// Move files and folders from old lib folder to new one
		if (fs.existsSync(oldLibPath)) {
			fs.readdirSync(oldLibPath).forEach(file => {
				if (file !== "lib") {
					const filePath = path.join(oldLibPath, file);
					const newFilePath = path.join(newLibPath, file);
					fs.renameSync(filePath, newFilePath);
				}
			});
		}

		// Copy package.json to new lib folder
		const newPackageJsonPath = path.join(rootLibDir, "package.json");
		fs.copyFileSync(packageJsonPath, newPackageJsonPath);

		// Delete old lib folder
		fs.rmSync(oldLibPath, { recursive: true, force: true });

		console.log("Directory demo-app-lib updated successfully and default lib directory deleted.");
	} catch (error) {
		console.error({ error });
	}
}

main();
