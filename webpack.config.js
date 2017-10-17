const webpack = require('webpack');
const WebpackShellPlugin = require('webpack-shell-plugin');
const { join } = require('path');

const srcPath = join(__dirname, 'src');
const distPath = join(__dirname, 'dist');
const pagesPath = join(srcPath, 'pages');

module.exports = ({ targetBrowser, nodeEnv }) => ({
  entry: {
    popup: join(pagesPath, 'popup', 'index.js'),
    background: join(pagesPath, 'background', 'index.js'),
    settings: join(pagesPath, 'settings', 'index.js'),
  },
  output: {
    path: distPath,
    filename: '[name]_bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/i,
        loader: 'babel-loader',
        query: {
          plugins: ['transform-es2015-modules-commonjs'],
        },
      },
    ],
  },
  plugins: [
    new WebpackShellPlugin({
      onBuildEnd: [
        `node ./scripts/build-manifest.js ${targetBrowser} ${distPath}`,
      ],
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(nodeEnv),
      },
    }),
  ],
});
