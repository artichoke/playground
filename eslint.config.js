// @ts-check

import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    ignores: [
      "dist/**/*",
      "emsdk/**/*",
      "target/**/*",
      "**/src/wasm/**/*.js",
      "**/src/wasm/**/*.wasm",
      "**/vendor/**/*",
    ],
  },
);
