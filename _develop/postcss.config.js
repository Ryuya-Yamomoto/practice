const progress = require('postcss-progress');
const csso = require('postcss-csso');

const path = require('path');
const paths = require('./paths.cjs');

const isAutoTablet = true; // If true, @media(--tb) is automatically created based on @media(--pc).
const isAutoVW = false; // If true, convert **px -> vw(**) automatically on @media(--sp).
const remBaseFontSize = 16; // for rem calculation
const desktopBaseWidth = 1400; // for calculation with vw when tablet
const mobileBaseWidth = 768; // for vw calculation

const vwPassThroughRatio = 1; // for decimal point problems with small values.

const getRoundedVw = (num) => {
  return Number.parseFloat(num).toFixed(2);
};

module.exports = {
  map: false,
  plugins: [
    progress.start(),
    require('postcss-import')(),
    require('postcss-nested')(),
    require('./npm_scripts/postcss-px2vw')(isAutoVW),
    require('./npm_scripts/postcss-auto-tablet')(isAutoTablet),
    require('./npm_scripts/postcss-replace-figma-value')(),
    require('./npm_scripts/postcss-aspect-fix')(),
    require('postcss-custom-media')(),
    require('postcss-functions')({
      /*
        While mixins and functions are certainly useful, it is better to have CSS that is closer to native CSS for long-term maintenance.
        It is better to use "calc" and "css-variable" as much as possible.
      */
      functions: {
        rem(num) {
          return `${num / remBaseFontSize}rem`;
        },
        pw(num) {
          if (Math.abs(num) <= vwPassThroughRatio) return `${num}px`;
          return `${getRoundedVw((num / desktopBaseWidth) * 100)}vw`;
        },
        vw(num) {
          if (Math.abs(num) <= vwPassThroughRatio) return `${num}px`;
          return `${getRoundedVw((num / mobileBaseWidth) * 100)}vw`;
        },
      },
    }),
    require('postcss-momentum-scrolling')(['auto', 'scroll']),
    require('postcss-will-change-transition')(),
    require('autoprefixer')(),
    require('postcss-cachebuster')({
      type: 'checksum',
      cssPath: `./${path.join(paths.appDest, `${paths.subDirectory}${paths.assetPath}/css/`)}`,
    }),
    require('postcss-reporter')({
      clearReportedMessages: true,
    }),
    csso({
      restructure: false,
    }),
    progress.stop(),
  ],
};
