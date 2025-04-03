const js = require("@eslint/js");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const prettier = require("eslint-config-prettier");
const globals = require("globals");

module.exports = [
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
  { ...prettier },
];
