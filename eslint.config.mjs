import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  { ignores: [".next/**", "node_modules/**", "public/**", "out/**", "coverage/**", "test-results/**", "scripts/migrate-tool-layouts.mjs"] },
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "no-undef": "error",
      "no-unused-vars": ["error", { "varsIgnorePattern": "^React$", "argsIgnorePattern": "^_" }],
      "import/no-duplicates": "error",
    },
    settings: { react: { version: "detect" } }
  },
  {
    files: ["src/app/pdf-redaction/components/PDFRedactionClient.js"],
    rules: { "react-hooks/exhaustive-deps": "off" }
  },
  {
    files: ["**/*.test.*", "tests/**"],
    rules: {
      "no-unused-vars": ["warn", { "varsIgnorePattern": "^React$", "argsIgnorePattern": "^_" }],
      "no-undef": "off",
    },
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
        test: "readonly",
        beforeAll: "readonly",
        beforeEach: "readonly",
        afterAll: "readonly",
        afterEach: "readonly",
      },
    },
  }
];

export default eslintConfig;
