const { exec } = require("child_process");
const fs = require("fs");

const cloneDir = "amazon-location-web-marketing-temp";
const libDir = "demo-app-lib";

function runCommand(command, cwd) {
	return new Promise((resolve, reject) => {
		exec(command, { cwd }, (error, stdout) => {
			if (error) {
				reject(error);
			} else {
				resolve(stdout.trim());
			}
		});
	});
}

async function main() {
	try {
		// Run npm install in current directory
		console.log(`Running npm install and npm run local-lib in current directory...`);
		await runCommand(`npm install && npm run local-lib`);

		// Read the package.json file from demo-app-lib in current directory, delete the prepare script, empty the dependencies and devDependencies
		const packageJson = JSON.parse(fs.readFileSync("demo-app-lib/package.json", "utf-8"));
		delete packageJson.scripts.prepare;
		packageJson.dependencies = {};
		packageJson.devDependencies = {};
		fs.writeFileSync("demo-app-lib/package.json", JSON.stringify(packageJson, null, 2));

		// Copy .env file from current directory into amazon-location-web-marketing-temp directory
		console.log(`Copy .env file from current directory into ${cloneDir} directory...`);
		await runCommand(`cp .env ../${cloneDir}`);

		// Copying the library directory to the amazon-location-web-marketing-temp directory in node_modules
		console.log(
			"Copying the library directory from current directory to the amazon-location-web-marketing-temp directory in node_modules..."
		);
		fs.mkdirSync(`../${cloneDir}/node_modules/${libDir}`, { recursive: true, force: true });
		fs.cpSync(`./${libDir}/`, `../${cloneDir}/node_modules/${libDir}/`, { recursive: true, force: true });

		// Run npm install and npm run build in amazon-location-web-marketing-temp directory
		console.log(`Running npm install and npm run build in ${cloneDir} directory...`);
		await runCommand(`cd ../${cloneDir} && npm install && npm run build`);

		// Copy the build directory from amazon-location-web-marketing-temp directory to current directory
		console.log(`Copying the build directory from ${cloneDir} directory to current directory...`);
		fs.mkdirSync(`build`, { recursive: true, force: true });
		fs.cpSync(`../${cloneDir}/build/`, "./build", { recursive: true, force: true });

		console.log("Done.");
	} catch (error) {
		console.error(`Error: ${error.message}`);
		throw new Error(`Error: ${error}`);
	}
}

main();
