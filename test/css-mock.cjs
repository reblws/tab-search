// Custom CSS mock that provides expected values for photon.css
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

// Register custom handler for CSS files that returns mock object
hook.default(['.css'], (module, filename) => {
  if (filename.includes('photon.css')) {
    module.exports = photonColors;
  } else {
    module.exports = {};
  }
});
