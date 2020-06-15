module.exports = {
  "extends": "airbnb-base",
  "parser": "babel-eslint",
  "plugins": ["react"],
  "env": {
    "browser": true
  },
  "rules": {
    "linebreak-style": 0,
    "global-require": 0,
    "consistent-return": "off",
    "prefer-arrow-callback": "off",
    "func-names": "off",
    "eslint linebreak-style": [0, "error", "windows"],
    "import/prefer-default-export": "off",
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error"
  },
  "overrides": [
    {
      "files": [
        "**/*.spec.js",
        "**/*.spec.jsx",
        "**/*.test.js",
        "**/*.test.jsx",
      ],
      "env": {
        "jest": true
      }
    }
  ]
};