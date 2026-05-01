import antfu from "@antfu/eslint-config"

export default antfu({
	markdown: false,
	stylistic: false,
	jsonc: false,
	jsx: false,
	pnpm: false,
	toml: false,
	typescript: {
		overrides: {
			"no-console": "off",
			"antfu/no-top-level-await": "off",
			"node/prefer-global/process": "off",
			"ts/consistent-type-definitions": "off",
			"ts/no-unsafe-argument": "off",
			"ts/no-unsafe-assignment": "off",
			"ts/no-use-before-define": "off",
			"unicorn/number-literal-case": "off",
			"unused-imports/no-unused-vars": "off",

			// for oxc type generation
			"ts/explicit-function-return-type": "error",
			// auto-fix type imports
			"import/consistent-type-specifier-style": ["error", "prefer-top-level"],
			"ts/consistent-type-imports": [
				"error",
				{ fixStyle: "inline-type-imports", disallowTypeAnnotations: false },
			],

			"perfectionist/sort-imports": [
				"error",
				{
					type: "natural",
					internalPattern: ["^[@~#]/"],
					newlinesBetween: 1,
					groups: ["builtin", "external", "internal", "parent", "sibling", "index", "unknown"],
				},
			],
		},
	},
})
