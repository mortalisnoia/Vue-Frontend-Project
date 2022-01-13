module.exports = {
  preset: '@vue/cli-plugin-unit-jest',

  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      // tell Jest to handle `*.vue` files
      "vue"
    ],
    "transform": {
      // process `*.vue` files with `vue-jest`
      ".*\\.(vue)$": "vue-jest"
    },
    "collectCoverage": true,
    "collectCoverageFrom": ["**/*.{js,vue}", "!**/node_modules/**"]
  }
}
