// core/ specs run without the browser mock, so code that reaches for
// `browser` fails here instead of passing silently
module.exports = {
  require: ['./test/css-mock.cjs', '@babel/register', './test/core-setup.cjs'],
  spec: 'src/core/**/*.spec.js',
  'node-option': ['experimental-require-module', 'no-warnings'],
};
