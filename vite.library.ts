import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import eslint from "vite-plugin-eslint";
import svgr from "vite-plugin-svgr";

const packageNames = [
	"@aws-amplify/ui-react",
	"@turf/turf",
	"aws-amplify",
	"aws-sdk",
	"date-fns",
	"mapbox-gl-draw-circle",
	"ngeohash",
	"ramda",
	"react",
	"react-dom",
	"react-router-dom",
	"react-toastify",
	"react-tooltip",
	"zustand",
	"react-map-gl",
	"react/jsx-runtime",
	"@aws-amplify/pubsub",
	"zustand/middleware",
	"@turf/distance",
	"@mapbox/mapbox-gl-draw",
	"react/jsx-dev-runtime",
	"mapbox-gl",
	"styled-components",
	"i18next",
	"i18next-browser-languagedetector",
	"react-device-detect",
	"@aws-sdk/credential-providers",
	"react-i18next"
];

export default defineConfig(() => {
	return {
		plugins: [
			react(),
			svgr(),
			eslint({
				fix: true,
				failOnError: false
			}),
			dts({ insertTypesEntry: true })
		],
		define: {
			"process.env": process.env,
			global: "window",
			__vite_process_env_NODE_ENV: JSON.stringify(process.env.NODE_ENV)
		},
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
			outDir: "./lib",
			sourcemap: true,
			lib: {
				entry: {
					"demo-page": path.resolve(__dirname, "src/index.ts")
				},
				name: "DemoPage",
				formats: ["cjs"],
				fileName: (format, name) => `${name}.${format}.js`
			},
			rollupOptions: {
				external: packageNames,
				output: {
					globals: {
						react: "React",
						"react-dom": "ReactDOM"
					}
				}
			},
			emptyOutDir: true
		},
		optimizeDeps: {
			disabled: false
		}
	};
});
