import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // React-specific rules to catch import issues
      "react/jsx-uses-react": "error", // Prevent React from being marked as unused
      "react/jsx-uses-vars": "error", // Prevent variables used in JSX from being marked as unused
      "no-undef": "error", // Disallow use of undeclared variables
      "no-unused-vars": ["error", { 
        "varsIgnorePattern": "^React$",
        "argsIgnorePattern": "^_"
      }],
      // Enforce consistent import patterns
      "import/no-duplicates": "error", // Prevent duplicate imports
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  },
  {
    files: ["src/app/pdf-redaction/components/PDFRedactionClient.js"],
    rules: {
      "react-hooks/exhaustive-deps": "off"
    }
  }
];

export default eslintConfig;
