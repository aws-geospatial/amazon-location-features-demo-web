import { resolve } from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import eslint from "vite-plugin-eslint";
import Inspect from "vite-plugin-inspect";
import svgr from "vite-plugin-svgr";

export default defineConfig(() => {
	return {
		plugins: [
			react(),
			svgr(),
			eslint({
				fix: true,
				failOnError: false
			}),
			dts({ insertTypesEntry: true }),
			Inspect({
				build: false,
				outputDir: ".vite-inspect"
			})
		],
		define: {
			"process.env": process.env,
			global: "window",
			__vite_process_env_NODE_ENV: JSON.stringify(process.env.NODE_ENV)
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
				"./runtimeConfig": "./runtimeConfig.browser"
			}
		},
		build: {
			outDir: "./lib",
			sourcemap: false,
			minify: true,
			lib: {
				entry: resolve(__dirname, "src/index.ts"),
				name: "DemoLib",
				formats: ["es"],
				fileName: (format, name) => `${name}.${format}.js`
			},
			rollupOptions: {
				emptyOutDir: true,
				external: [
					/* Core deps */
					"@aws-amplify/ui-react",
					"@aws-sdk/client-cognito-identity",
					"@@aws-sdk/client-geo-places",
					"@aws-sdk/client-geo-routes",
					"@aws-sdk/client-iot",
					"@aws-sdk/client-location",
					"@aws-sdk/client-pinpoint",
					"@aws-sdk/credential-providers",
					"@aws/amazon-location-utilities-auth-helper",
					"@turf/turf",
					"aws-amplify",
					"aws-iot-device-sdk-v2",
					"date-fns",
					"i18next",
					"i18next-browser-languagedetector",
					"maplibre-gl-draw-circle",
					"maplibre-gl",
					"ngeohash",
					"ramda",
					"react",
					"react-device-detect",
					"react-dom",
					"react-i18next",
					"react-map-gl",
					"react-router-dom",
					"react-spring-bottom-sheet",
					"react-toastify",
					"react-tooltip",
					"zustand",
					/* Other deps */
					"react/jsx-runtime",
					"zustand/middleware",
					"@turf/distance",
					"@mapbox/mapbox-gl-draw",
					"react/jsx-dev-runtime",
					"mapbox-gl",
					"styled-components"
				],
				output: {
					globals: {
						react: "React",
						"react-dom": "ReactDOM"
					}
				}
			}
		},
		server: {
			port: 3000
		}
	};
});
