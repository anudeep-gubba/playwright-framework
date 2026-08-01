import js from "@eslint/js";
import playwright from "eslint-plugin-playwright";

export default [
  {
    ignores: [
      "node_modules/**",
      "allure-report/**",
      "allure-results/**",
      "playwright-report/**",
      "test-results/**",
      "logs/**",
    ],
  },
  {
    // eslint:recommended is tuned for plain JS ASTs and must never touch .ts files (see below).
    files: ["**/*.{js,mjs,cjs}"],
    ...js.configs.recommended,
  },
  {
    // TypeScript 7 (this project's pinned compiler) isn't supported by typescript-eslint yet
    // (github.com/typescript-eslint/typescript-eslint/issues/10940), so .ts files are parsed via
    // Babel instead — syntax/style linting only, type errors are already caught by `npm run typecheck`.
    files: ["**/*.ts"],
    languageOptions: {
      parser: (await import("@babel/eslint-parser")).default,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-typescript"],
        },
        sourceType: "module",
      },
    },
    // eslint:recommended assumes plain JS function/getter shapes and crashes on
    // TypeScript-only constructs (abstract methods, overload signatures, interface
    // members) that have no body — so TS files get a small, hand-verified rule set
    // instead of the full recommended config. Real type errors are tsc's job
    // (`npm run typecheck`); this is a style/quality pass on top.
    rules: {
      "no-undef": "off",
      // Not "no-unused-vars": the Babel parser has no type-checker, so it can't tell a
      // type-only import/parameter (e.g. `page: Page`) from a genuinely unused one and
      // flags nearly every typed signature in this codebase as a false positive.
      // tsconfig.json already enables noUnusedLocals/noUnusedParameters, so `npm run
      // typecheck` catches real unused-variable bugs correctly.
      "no-var": "error",
      "prefer-const": "warn",
      eqeqeq: ["error", "smart"],
      "no-duplicate-imports": "error",
      "no-console": "warn",
    },
  },
  {
    files: ["tests/**/*.ts"],
    ...playwright.configs["flat/recommended"],
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      // Assertions in this framework are centralized in src/validators/*.ts (see CLAUDE.md)
      // and called as e.g. `LoginValidator.expectLoginSuccess(...)` — the rule only sees
      // the bare `expect(...)` call by default, so teach it this project's naming convention.
      "playwright/expect-expect": ["warn", { assertFunctionPatterns: ["^expect"] }],
    },
  },
];
