const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');

const isProduction = process.env.NODE_ENV === 'production';
// Keep this constant because CopyWebPack changes dirs
const DIRNAME = __dirname;
const distFolder = path.join(DIRNAME, 'dist');
const releaseFolder = browser => path.join(DIRNAME, 'releases', browser);

function getPlugins() {
  const plugins = [];
  if (!isProduction) return plugins;
  plugins.push(new CleanWebpackPlugin(['releases']));
  const copyWebPack = new CopyWebpackPlugin([
    // Firefox
    {
      from: path.join(distFolder, 'manifest.json'),
      to: releaseFolder('firefox'),
    },
    {
      from: path.join(distFolder, 'assets', '*.svg'),
      to: path.join(releaseFolder('firefox'), 'assets'),
      flatten: true,
    },
    {
      from: path.join(distFolder, 'popup'),
      to: path.join(releaseFolder('firefox'), 'popup'),
    },
    {
      from: path.join(distFolder, 'icons'),
      to: path.join(releaseFolder('firefox'), 'icons'),
    },
    // Chrome
    {
      from: path.join(distFolder, 'assets'),
      to: path.join(releaseFolder('chrome'), 'assets'),
    },
    {
      from: path.join(distFolder, 'popup'),
      to: path.join(releaseFolder('chrome'), 'popup'),
    },
    {
      from: path.join(distFolder, 'icons'),
      to: path.join(releaseFolder('chrome'), 'icons'),
    },
    {
      from: path.join(distFolder, 'manifest.json'),
      to: releaseFolder('chrome'),
      // Have to transform the file to chrome-compatible manifest
      transform: transformToChromeManifest,
    },
  ], {
    copyUnmodified: true,
  });

  plugins.push(copyWebPack);

  return plugins;
}

// Transform the firefox manifest into one compatible with chrome
function transformToChromeManifest(content) {
  /*
  * Keys to modify:
  *    -- browser_action.default_icon: "assets/search64.png"
  * Keys to add:
  *    -- minimum_chrome_version: "59.0.3071"
  * Keys to remove:
  *    -- applications
  */
  const manifest = JSON.parse(content);
  delete manifest.applications;

  manifest.browser_action.default_icon = 'icons/logo-48.png';
  manifest.minimum_chrome_version = '59.0.3071';
  return JSON.stringify(manifest, null, 2);
}

function getOutput() {
  const output = {};
  if (isProduction) {
    output.path = path.join(__dirname, 'releases', 'firefox', 'popup');
    output.filename = 'bundle.js';
  } else {
    output.path = path.join(__dirname, 'dist', 'popup');
    output.filename = 'bundle.js';
  }
  return output;
}

module.exports = {
  entry: path.join(__dirname, 'src', 'index.js'),
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
  plugins: getPlugins(),
  output: getOutput(),
};
