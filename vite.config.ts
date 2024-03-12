import { resolve } from "path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";
import viteImagemin from "vite-plugin-imagemin";
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
			viteImagemin({
				svgo: {
					plugins: [
						{
							name: "removeViewBox"
						},
						{
							name: "removeEmptyAttrs",
							active: false
						}
					]
				},
				gifsicle: {
					optimizationLevel: 7
				},
				mozjpeg: false,
				optipng: {
					optimizationLevel: 7
				},
				pngquant: {
					speed: 11
				},
				webp: {
					quality: 75,
					method: 6
				}
			}),
			Inspect({
				build: false,
				outputDir: ".vite-inspect"
			})
		],
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
			outDir: "./build",
			sourcemap: false,
			minify: true,
			commonjsOptions: { include: [""] }
		},
		optimizeDeps: {
			disabled: false
		},
		server: {
			port: 3000
		}
	};
});
