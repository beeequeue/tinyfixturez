import process from "node:process"

import { defineConfig } from "tsdown"

export default defineConfig({
	entry: ["src/index.ts"],
	outDir: "dist",
	unbundle: true,
	exports: true,
	deps: {
		neverBundle: ["pathe", "vitest"],
	},

	env: {
		NODE_ENV: process.env.NODE_ENV ?? "production",
		DEV: process.env.NODE_ENV === "development",
		PROD: process.env.NODE_ENV === "production",
		TEST: false,
	},

	platform: "node",
	format: "esm",
	dts: { oxc: true },
	fixedExtension: true,
	minify: "dce-only",

	publint: true,
})
