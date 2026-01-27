module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: ['last 2 versions', 'Firefox ESR'],
      },
    }],
  ],
  plugins: [
    ['module-resolver', {
      root: ['./src'],
      extensions: ['.js'],
    }],
  ],
};
