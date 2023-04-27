import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";
import svgr from "vite-plugin-svgr";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default defineConfig(({ mode }) => {
	return {
		plugins: [
			react(),
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
				"./runtimeConfig": "./runtimeConfig.browser"
			}
		},
		server: {
			port: 3000
		},
		build: {
			outDir: "./build",
			commonjsOptions: { include: [] },
			sourcemap: false
		},
		optimizeDeps: {
			disabled: false
		}
	};
});
