module.exports = {
    "extends": "airbnb-base",
    "plugins": [
        "import"
    ],
    "env": {
        "browser": true,
        "webextensions": true,
    },
    "rules": {
        "no-use-before-define": 0,
        "no-fallthrough": 0,
        "no-param-reassign": 0,
        "import/prefer-default-export": 0,
        "no-underscore-dangle": 0,
        "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
        "ignoreRestSiblings": 0
    }
};
