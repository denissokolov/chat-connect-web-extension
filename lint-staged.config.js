/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
export default {
  '*.{js,jsx,ts,tsx,json,css,md}': 'prettier --write',
  '*.{js,jsx,ts,tsx}': 'eslint --fix',
}
