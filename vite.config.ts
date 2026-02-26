// vite.config.ts
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import eslint from "vite-plugin-eslint2";
import Inspect from "vite-plugin-inspect";
import svgr from "vite-plugin-svgr";


export default defineConfig(() => {
	return {
		plugins: [
			react(),
			svgr(),
			eslint({
				fix: true,
				failOnError: false,
			}),
			dts({ insertTypesEntry: true }),
			Inspect({
				build: false,
				outputDir: ".vite-inspect",
			})
		],
		define: {
			global: "window",
			__vite_process_env_NODE_ENV: JSON.stringify(process.env.NODE_ENV),
		},
		resolve: {
			alias: {
				"@demo/assets": resolve(__dirname, "./src/assets"),
				"@demo/core": resolve(__dirname, "./src/core"),
				"@demo/atomicui": resolve(__dirname, "./src/atomicui"),
				"@demo/hooks": resolve(__dirname, "./src/hooks"),
				"@demo/services": resolve(__dirname, "./src/services"),
				"@demo/stores": resolve(__dirname, "./src/stores"),
				"@demo/types": resolve(__dirname, "./src/types"),
				"@demo/theme": resolve(__dirname, "./src/theme"),
				"@demo/utils": resolve(__dirname, "./src/utils"),
				"@demo/locales": resolve(__dirname, "./src/locales"),
				"./runtimeConfig": "./runtimeConfig.browser",
			},
		},
		build: {
			commonjsOptions: {
				transformMixedEsModules: true,
			},
			outDir: "./lib",
			sourcemap: false,
			minify: true,
			lib: {
				entry: resolve(__dirname, "src/index.ts"),
				formats: ["es"],
				fileName: (format, name) => `${name}.${format}.js`,
			},
			rollupOptions: {
				external: [
					"@aws-amplify/ui-react",
					"aws-amplify",
					"i18next",
					"i18next-browser-languagedetector",
					"ramda",
					"react",
					"react-device-detect",
					"react-dom",
					"react-i18next",
					"react-router-dom",
					"react-spring-bottom-sheet",
					"react-toastify",
					"react-tooltip",
				],
				output: {
					assetFileNames: (chunkInfo) =>
						chunkInfo.names.includes("amazon-location-features-demo-web.css")
							? "style.css"
							: chunkInfo.names.join("-"),
				},
			},
		},
		server: {
			port: 3000,
		},
		test: {
			globals: true,
			environment: "jsdom",
			setupFiles: "./src/setupTests.ts",
			css: true,
		},
	};
});
