import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		mockReset: true,
		clearMocks: true,
		restoreMocks: true,

		experimental: {
			preParse: true,
			viteModuleRunner: false,
		},
	},
})
