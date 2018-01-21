const webpack = require('webpack');
const WebpackShellPlugin = require('webpack-shell-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// const FileWatcherPlugin = require('filewatcher-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { join } = require('path');

const SRC_PATH = join(__dirname, 'src');
const DIST_PATH = join(__dirname, 'dist');
const PAGES_PATH = join(SRC_PATH, 'core', 'pages');

// https://github.com/reactjs/react-redux/pull/680/files#diff-11e9f7f953edc64ba14b0cc350ae7b9dR20
// Replace webpack/global.js definition with window
function applyGlobalVar(compiler) {
  compiler.plugin('compilation', (compilation, params) => {
    params.normalModuleFactory.plugin('parser', (parser) => {
      parser.plugin('expression global', function expressionGlobalPlugin() {
        this.state.module.addVariable('global', 'window');
        return false;
      });
    });
  });
}

const plugins = [
  new CleanWebpackPlugin(DIST_PATH),
  new CopyWebpackPlugin([{ from: join(SRC_PATH, 'static'), to: DIST_PATH }]),
  new WebpackShellPlugin({
    onBuildEnd: [
      `node ./scripts/build-manifest.js ${process.env.BROWSER} ${DIST_PATH}`,
    ],
  }),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  }),
  { apply: applyGlobalVar },
];
if (process.env.NODE_ENV === 'production') {
  // web-ext zip strips out sourcemaps, so we need to beautify the output
  // so destructuring assignments don't break. Need to investigate this more.
  plugins.push(new UglifyJsPlugin({
    uglifyOptions: {
      output: { beautify: true, comments: true },
      mangle: false,
    },
  }));
  // lodash-es/_root.js calls eval, replace it with our own definition here
  // so we can pass AMO validation tests
  plugins.push(new webpack.NormalModuleReplacementPlugin(
    /lodash-es\/_root.js/,
    join(SRC_PATH, 'patch', 'lodash-es._root.js'),
  ));
}
const webpackConfig = {
  module: {
    rules: [
      {
        test: /\.svg/,
        use: {
          loader: 'svg-url-loader',
          options: {
            noquotes: true,
          },
        },
        exclude: /node_modules/,
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
  },
  target: 'web',
  plugins,
  resolve: {
    modules: [
      join(__dirname, 'src'),
      'node_modules',
    ],
  },
};

if (process.env.NODE_ENV === 'development') {
  webpackConfig.devtool = 'sourcemap';
}

module.exports = webpackConfig;
