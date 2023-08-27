import fs from "fs";
import module from "module";
import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import type { Plugin } from "vite";
import eslint from "vite-plugin-eslint";
import svgr from "vite-plugin-svgr";
const require = module.createRequire(import.meta.url);

export default defineConfig(() => {
	return {
		plugins: [
			react(),
			reactVirtualized(),
			svgr(),
			eslint({
				fix: true,
				failOnError: false
			})
		],
		resolve: {
			alias: {
				"@demo/assets": path.resolve(__dirname, "./src/assets"),
				"@demo/core": path.resolve(__dirname, "./src/core"),
				"@demo/atomicui": path.resolve(__dirname, "./src/atomicui"),
				"@demo/hooks": path.resolve(__dirname, "./src/hooks"),
				"@demo/services": path.resolve(__dirname, "./src/services"),
				"@demo/stores": path.resolve(__dirname, "./src/stores"),
				"@demo/types": path.resolve(__dirname, "./src/types"),
				"@demo/theme": path.resolve(__dirname, "./src/theme"),
				"@demo/utils": path.resolve(__dirname, "./src/utils"),
				"@demo/locales": path.resolve(__dirname, "./src/locales"),
				"./runtimeConfig": "./runtimeConfig.browser"
			}
		},
		server: {
			port: 3000
		},
		build: {
			outDir: "./build",
			commonjsOptions: { include: [] },
			chunkSizeWarningLimit: 2097152,
			sourcemap: false,
			minify: true,
			rollupOptions: {
				external: [""]
			}
		},
		optimizeDeps: {
			exclude: [""],
			disabled: false
		}
	};
});

const WRONG_CODE = 'import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";';
export function reactVirtualized(): Plugin {
	return {
		name: "flat:react-virtualized",
		// Note: we cannot use the `transform` hook here
		//       because libraries are pre-bundled in vite directly,
		//       plugins aren't able to hack that step currently.
		//       so instead we manually edit the file in node_modules.
		//       all we need is to find the timing before pre-bundling.
		configResolved() {
			const file = require
				.resolve("react-virtualized")
				.replace(
					path.join("dist", "commonjs", "index.js"),
					path.join("dist", "es", "WindowScroller", "utils", "onScroll.js")
				);
			const code = fs.readFileSync(file, "utf-8");
			const modified = code.replace(WRONG_CODE, "");
			fs.writeFileSync(file, modified);
		}
	};
}
