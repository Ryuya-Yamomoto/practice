const chokidar = require('chokidar');
const { HtmlValidate } = require('html-validate');
const path = require('path');
const fs = require('fs');
const colors = require('./colors.cjs');
const paths = require('../paths.cjs');

const targetDir = `${paths.appBuild}`;
const configPath = path.join(__dirname, '../htmlvalidate.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const htmlValidate = new HtmlValidate(config);

const watcher = chokidar.watch(targetDir, {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 500,
    pollInterval: 100,
  },
  recursive: true,
});

watcher.on('all', async (event, filePath) => {
  if (path.extname(filePath) === '.html') {
    await validateFile(filePath);
  }
});

async function validateFile(filePath) {
  try {
    const report = await htmlValidate.validateFile(filePath);

    if (!report.results) {
      console.error(`Validation failed for ${filePath}: No results returned.`);
      return;
    }

    if (report.valid) {
    } else {
      console.log(`${colors.magentaBg} HTML validate ${colors.reset} ${filePath}`);
      report.results.forEach((result) => {
        result.messages.forEach((message) => {
          const errorMessage = `${message.message}`;
          const lineInfo = `(line ${message.line}, column ${message.column})`;

          console.error(`\x1b[31m${errorMessage}\x1b[0m ${lineInfo} : ${message.ruleUrl}`);
        });
      });
    }
  } catch (error) {
    console.error(`Error validating ${filePath}:`, error.message);
  }
}
