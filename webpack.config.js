const webpack = require('webpack');
const WebpackShellPlugin = require('webpack-shell-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const { join } = require('path');

const SRC_PATH = join(__dirname, 'src');
const DIST_PATH = join(__dirname, 'dist');
const PAGES_PATH = join(SRC_PATH, 'pages');

// https://github.com/reactjs/react-redux/pull/680/files#diff-11e9f7f953edc64ba14b0cc350ae7b9dR20
// Replace webpack/global.js definition with an IFFE returning the global object
// Avoids eval statement
function applyGlobalVar(compiler) {
  compiler.plugin('compilation', (compilation, params) => {
    params.normalModuleFactory.plugin('parser', function(parser) {
      parser.plugin('expression global', function expressionGlobalPlugin() {
        this.state.module.addVariable(
          'global',
          '(function() { return this; }())',
        );
        return false;
      });
    });
  });
}

module.exports = ({ targetBrowser, nodeEnv }) => {
  const plugins = [
    new WebpackShellPlugin({
      onBuildEnd: [
        `node ./scripts/build-manifest.js ${targetBrowser} ${DIST_PATH}`,
      ],
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(nodeEnv),
    }),
    { apply: applyGlobalVar },
  ];
  if (nodeEnv === 'production') {
    plugins.push(new UglifyJsPlugin({
      uglifyOptions: {
        output: { beautify: true, comments: true },
      },
    }));
    // lodash-es/_root.js calls eval, replace it with our own definition here
    // so we can pass AMO validation tests
    plugins.push(new webpack.NormalModuleReplacementPlugin(
      /lodash-es\/_root.js/,
      join(SRC_PATH, 'patch', 'lodash-es._root.js'),
    ));
  }
  return {
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
  };
};
