module.exports = {
  require: ['./test/css-mock.cjs', '@babel/register', './test/setup.cjs'],
  spec: ['src/shell/**/*.spec.js', 'src/pages/**/*.spec.js'],
  'node-option': ['experimental-require-module', 'no-warnings'],
};
