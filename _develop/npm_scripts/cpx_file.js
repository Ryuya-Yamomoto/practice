const fs = require('fs');
const cpx = require('cpx');
const paths = require('../paths.cjs');

const colors = require('./colors.cjs');

if (!fs.existsSync(`${paths.appBuild}/${paths.assetPath}/`)) {
  fs.mkdirSync(`${paths.appBuild}/${paths.assetPath}/`, { recursive: true });
}

cpx.copy(
  'src/static_files/**/*',
  `${paths.appBuild}/${paths.assetPath}/`,
  {
    clean: false,
  },
  function () {
    console.log(`\n${colors.magentaBg}${colors.black} All file copy complete. ${colors.reset}\n`);
  },
);
