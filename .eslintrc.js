module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
  },
  extends: "eslint:recommended",
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    // "no-console": "warn",
    "no-unused-vars": "error",

    // "arrow-parens": ["error", "as-needed"],
  },
};
