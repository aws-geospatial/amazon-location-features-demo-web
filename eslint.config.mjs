import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import globals from "globals";

export default [
	{
		ignores: ["dist/**", "lib/**", "coverage/**", "node_modules/**", "extra/**", "cypress/**"],
	},
	eslint.configs.recommended,
	{
		files: ["**/*.{js,mjs,ts,tsx}"],
		languageOptions: {
			parser: tsparser,
			parserOptions: {
				sourceType: "module",
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				...globals.browser,
				...globals.node,
				fetch: "readonly",
			},
		},
		plugins: {
			"@typescript-eslint": tseslint,
			prettier,
			react,
			"react-hooks": reactHooks,
			import: importPlugin,
		},
		settings: {
			react: {
				version: "18.2.0",
			},
		},
		rules: {
			...tseslint.configs.recommended.rules,
			...react.configs.recommended.rules,
			"@typescript-eslint/ban-types": [
				"error",
				{
					extendDefaults: true,
					types: { "{}": false },
				},
			],
			"@typescript-eslint/explicit-module-boundary-types": "warn",
			"@typescript-eslint/no-empty-function": "off",
			"@typescript-eslint/no-empty-interface": "off",
			"@typescript-eslint/no-explicit-any": "warn",
			"@typescript-eslint/no-non-null-assertion": "off",
			"class-methods-use-this": "off",
			"comma-dangle": "off",
			"import/no-unresolved": 0,
			"import/named": 0,
			"import/namespace": 0,
			"import/default": 0,
			"import/no-named-as-default-member": 0,
			"import/order": [
				"error",
				{
					groups: ["builtin", "unknown", "external", "internal", "sibling"],
					pathGroups: [
						{
							pattern: "react",
							group: "builtin",
							position: "before",
						},
						{ pattern: "apps/**", group: "internal" },
						{ pattern: "assets/**", group: "internal" },
						{ pattern: "config", group: "internal" },
						{ pattern: "core/**", group: "internal" },
						{ pattern: "i8n/**", group: "internal" },
						{ pattern: "modules/**", group: "internal" },
						{ pattern: "shared/**", group: "internal" },
						{ pattern: "theme/**", group: "internal" },
						{ pattern: "utils/**", group: "internal" },
					],
					pathGroupsExcludedImportTypes: ["react"],
					"newlines-between": "always-and-inside-groups",
					alphabetize: {
						order: "asc",
						caseInsensitive: false,
					},
				},
			],
			indent: 0,
			"no-param-reassign": [2, { props: false }],
			"no-tabs": ["off", { allowIndentationTabs: true }],
			"no-use-before-define": "off",
			"no-unused-vars": "error",
			"prettier/prettier": [
				"error",
				{
					endOfLine: "auto",
					arrowParens: "avoid",
				},
			],
			quotes: ["error", "double", { avoidEscape: true }],
			"react/prop-types": "off",
			"react/jsx-filename-extension": "off",
			"react/jsx-uses-react": "error",
			"react/jsx-uses-vars": "error",
			"sort-imports": [
				"error",
				{
					ignoreCase: false,
					ignoreDeclarationSort: true,
					ignoreMemberSort: false,
					memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
				},
			],
			"react-hooks/rules-of-hooks": "error",
			"react-hooks/exhaustive-deps": "warn",
			"no-undef-init": "error",
			"import/no-unused-modules": [0, { unusedExports: true }],
		},
	},
	{
		files: ["**/*.{js,mjs}"],
		rules: {
			"@typescript-eslint/ban-types": "off",
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-empty-function": "off",
			"@typescript-eslint/no-empty-interface": "off",
			"@typescript-eslint/no-explicit-any": "error",
			"@typescript-eslint/no-non-null-assertion": "off",
			"@typescript-eslint/no-var-requires": "off",
		},
	},
	{
		files: ["**/*.{ts,tsx}"],
		rules: {
			"@typescript-eslint/explicit-module-boundary-types": "off",
			"@typescript-eslint/no-unused-vars": 1,
			"@typescript-eslint/no-explicit-any": "error",
			"no-unused-vars": "off",
			"react/display-name": "off",
			"import/no-named-as-default": 0,
			"react-hooks/exhaustive-deps": "warn",
			"react/react-in-jsx-scope": 0,
		},
	},
];
