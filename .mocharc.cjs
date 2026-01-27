module.exports = {
  require: ['./test/css-mock.cjs', '@babel/register', './test/setup.cjs'],
  spec: 'src/**/*.spec.js',
  'node-option': ['experimental-require-module', 'no-warnings'],
};
