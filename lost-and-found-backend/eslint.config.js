import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{ts,js}"],
    extends: ["js.configs.recommended"],
    languageOptions: {
      globals: globals.node,
    },
  },
  tseslint.configs.recommended,
]);
