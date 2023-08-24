module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  globals: {
    globalThis: true,
  },
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: 2020,
    sourceType: "module",
    jsxPragma: "React",
    ecmaFeatures: {
      jsx: true,
    },
  },
  extends: ["eslint-config-sprite", "plugin:@typescript-eslint/recommended"],
  rules: {
    complexity: ["warn", 25],
    "no-unused-vars": "warn",
    "no-restricted-globals": "off",
    "max-params": ["warn", 7],
    "import/no-anonymous-default-export": "off",
    "no-console": "warn",
    "import/no-named-as-default": "off",
    "import/no-named-as-default-member": "off",
    "no-return-await": "off",
  },
};
