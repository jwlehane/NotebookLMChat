const globals = require("globals");
const pluginJs = require("@eslint/js");

module.exports = [
  {
    languageOptions: {
        globals: {
            ...globals.browser,
            ...globals.webextensions,
            ...globals.node,
            ...globals.jest,
            firebase: "readonly",
            firebaseConfig: "readonly"
        }
    }
  },
  pluginJs.configs.recommended,
  {
    rules: {
        "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
        "no-undef": "error"
    }
  }
];
