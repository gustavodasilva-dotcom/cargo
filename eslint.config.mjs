import globals from "globals";
import pluginJs from "@eslint/js";
import sortImportRequires from "eslint-plugin-sort-imports-requires";

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
      globals: globals.node,
    },
    plugins: {
      'sort-imports-requires': sortImportRequires
    },
    rules: {
      "eqeqeq": "warn",
      "no-unused-vars": "error",
      "prefer-const": ["error", { ignoreReadBeforeAssign: true }],
      "sort-imports-requires/sort-requires": ["error", { unsafeAutofix: true }],
    },
  },
  pluginJs.configs.recommended,
];
