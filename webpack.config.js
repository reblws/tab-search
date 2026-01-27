const webpack = require('webpack');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { join } = require('path');

const SRC_PATH = join(__dirname, 'src');
const DIST_PATH = join(__dirname, 'dist');
const PAGES_PATH = join(SRC_PATH, 'core', 'pages');

const plugins = [
  new CopyWebpackPlugin({
    patterns: [{ from: join(SRC_PATH, 'static'), to: DIST_PATH }],
  }),
  new WebpackShellPluginNext({
    onBuildEnd: {
      scripts: [
        `node ./scripts/build-manifest.js ${process.env.BROWSER} ${DIST_PATH}`,
      ],
      blocking: true,
      parallel: false,
    },
  }),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  }),
];

const webpackConfig = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.svg/,
        type: 'asset/inline',
        generator: {
          dataUrl: content => content.toString(),
        },
      },
      {
        test: /\.css$/,
        loader: 'css-object-loader',
        exclude: /node_modules/,
      },
    ],
  },
  entry: {
    popup: join(PAGES_PATH, 'popup', 'index.js'),
    background: join(PAGES_PATH, 'background', 'index.js'),
    settings: join(PAGES_PATH, 'settings', 'index.js'),
  },
  output: {
    path: DIST_PATH,
    filename: '[name]_bundle.js',
    clean: true,
    globalObject: 'self',
    environment: {
      globalThis: true,
    },
  },
  target: 'web',
  plugins,
  resolve: {
    modules: [
      join(__dirname, 'src'),
      'node_modules',
    ],
  },
  optimization: {
    minimize: process.env.NODE_ENV === 'production',
    minimizer: [
      (compiler) => {
        const TerserPlugin = require('terser-webpack-plugin');
        new TerserPlugin({
          terserOptions: {
            // web-ext zip strips out sourcemaps, so we need to beautify the output
            // so destructuring assignments don't break.
            format: {
              beautify: true,
              comments: true,
            },
            mangle: false,
          },
        }).apply(compiler);
      },
    ],
  },
};

if (process.env.NODE_ENV === 'development') {
  webpackConfig.devtool = 'source-map';
}

module.exports = webpackConfig;
