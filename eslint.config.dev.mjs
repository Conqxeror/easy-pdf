import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // React-specific rules
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
      "react/react-in-jsx-scope": "off", // Next.js handles this
      
      // Import rules
      "import/no-duplicates": "error",
      
      // Unused variables - WARNINGS for development
      "no-unused-vars": ["warn", {
        "vars": "all",
        "args": "after-used",
        "ignoreRestSiblings": false,
        "varsIgnorePattern": "^React$|^_",
        "argsIgnorePattern": "^_"
      }],
      
      // TypeScript unused variables
      "@typescript-eslint/no-unused-vars": ["warn", {
        "vars": "all", 
        "args": "after-used",
        "ignoreRestSiblings": false,
        "varsIgnorePattern": "^React$|^_",
        "argsIgnorePattern": "^_"
      }],
      
      // Undefined variables
      "no-undef": "error"
    }
  }
];

export default eslintConfig;