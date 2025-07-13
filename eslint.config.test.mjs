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
      // React-specific rules (strict)
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react/react-in-jsx-scope": "error",
      
      // Unused variable rules (temporarily as warnings for testing)
      "no-unused-vars": ["warn", { 
        "varsIgnorePattern": "^React$",
        "argsIgnorePattern": "^_"
      }],
      
      // Undefined variable rules (strict)
      "no-undef": "error"
    }
  }
];

export default eslintConfig;