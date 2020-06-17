module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    "airbnb",
    "airbnb/hooks",
  ],
  rules: {
    'no-console': 'off',
    'linebreak-style': 'off',
    'max-len': [ 'warn', { 'code': 175 } ],
  }
}
