// Custom CSS mock that provides expected values for CSS files
const hook = require('ignore-styles');

// Default photon color values for testing
const photonColors = {
  ':root': {
    blue60: '#0060df',
    yellow50: '#ffe900',
    red60: '#d70022',
    ink70: '#363959',
    purple70: '#6200a4',
  },
};

// Acorn design system tokens for testing
const acornColors = {
  ':root': {
    colorBlue60: '#0060df',
    colorYellow50: '#ffe900',
    colorRed60: '#d70022',
    colorInk70: '#363959',
    colorPurple70: '#6200a4',
  },
};

// Register custom handler for CSS files that returns mock object
hook.default(['.css'], (module, filename) => {
  if (filename.includes('photon.css')) {
    module.exports = photonColors;
  } else if (filename.includes('acorn-tokens.css')) {
    module.exports = acornColors;
  } else {
    module.exports = {};
  }
});
