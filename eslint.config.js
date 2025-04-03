import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: ["**/node_modules/", ".git/", "dist/", ".env", ".env.*"],
  },
  js.configs.recommended,
  {
    languageOptions: {
      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        process: "readonly",
        myCustomGlobal: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    files: ["**/*.ts"],
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "no-console": "error",
      "dot-notation": "error",
      "no-process-env": "error",
    },
  },
  prettier,
];
