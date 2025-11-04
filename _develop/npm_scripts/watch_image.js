const fs = require('fs');
const cpx = require('cpx');
const sharp = require('sharp');
const path = require('path');
const paths = require('../paths.cjs');

const colors = require('./colors.cjs');
sharp.cache(true);

const isWebP = process.env.npm_config_enable_webp;
const srcDir = `${paths.appSrc}images/**/*.+(jpg|jpeg|png|gif|svg)`;
const destDir = `${paths.appBuild}/${paths.assetPath}/images/`;
const webpDir = `${paths.appBuild}/${paths.assetPath}/images_min/`;

if (isWebP) {
  if (!fs.existsSync(`${paths.appBuild}/${paths.assetPath}`)) {
    fs.mkdirSync(`${paths.appBuild}/${paths.assetPath}`);
  }
  if (!fs.existsSync(webpDir)) {
    fs.mkdirSync(webpDir);
    console.log(`Created directory: ${webpDir}`);
  }
}

cpx
  .watch(srcDir, destDir, {
    clean: false,
    includeEmptyDirs: true,
    initialCopy: false,
    update: true,
  })
  .on('copy', (e) => {
    console.log(`${colors.cyanBg}${colors.black} change ${colors.reset} ${path.relative(destDir, e.dstPath)}`);
    if (isWebP) {
      if (!e.dstPath.match(/\.jpg$|\.jpeg$|\.png$/g)) return;
      const targetPath = e.dstPath.replace('images', 'images_min').replace(/\.jpg$|\.jpeg$|\.png$/g, '.webp');
      const targetDir = path.dirname(path.resolve(targetPath));

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      sharp(e.dstPath)
        .webp({ quality: 70, effort: 4 })
        .toFile(targetPath, (err, info) => {
          if (err) {
            console.log(err);
          }
        });
    }

    compressImage(e.dstPath);
  })
  .on('remove', (e) => {
    console.log(`${colors.whiteBg}${colors.black} unlink ${colors.reset} ${path.relative(destDir, e.path)}`);

    if (isWebP) {
      const resolvePath = path.resolve(e.path);
      const targetFile = resolvePath.replace('images', 'images_min').replace(/\.jpg$|\.jpeg$|\.png$/g, '.webp');

      if (fs.existsSync(targetFile)) {
        fs.unlinkSync(targetFile);
        console.log(
          `${colors.whiteBg}${colors.black} unlink ${colors.reset} ${path
            .relative(destDir, e.path)
            .replace(/\.jpg$|\.jpeg$|\.png$/g, '.webp')}`,
        );
      }
    }
  });

const compressImage = async (filePath) => {
  if (!filePath.match(/\.jpg$|\.jpeg$|\.png$/g)) return;

  const inputBuffer = await fs.promises.readFile(filePath);
  const beforeSize = inputBuffer.byteLength;

  let outputBuffer;
  if (/\.(jpe?g)$/i.test(filePath)) {
    outputBuffer = await sharp(inputBuffer).jpeg({ quality: 80, progressive: true, mozjpeg: true }).toBuffer();
  } else if (/\.(png)$/i.test(filePath)) {
    outputBuffer = await sharp(inputBuffer).png({ compressionLevel: 6, adaptiveFiltering: true, colors: 256, effort: 2 }).toBuffer();
  }
  const afterSize = outputBuffer.byteLength;
  let saved = ((beforeSize - afterSize) / beforeSize) * 100;

  if (saved >= 12.5) {
    await sharp(outputBuffer).toFile(filePath);
    console.log(
      `${colors.redBg}${colors.black} ${getNumStr(saved.toFixed(1))}% ${colors.reset} ${colors.cyan}${getGraphStr(saved)}${colors.reset} ${
        colors.reset
      }${getKB(beforeSize)}${colors.green} => ${colors.reset}${getKB(afterSize)} ${colors.gray}${path.relative(destDir, filePath)}${
        colors.reset
      }`,
    );
  }
};

const getNumStr = (num) => {
  let str = num.toString();
  while (str.length < 4) {
    str = '0' + str;
  }
  return str;
};
const getGraphStr = (num) => {
  let str = '';
  const refStr = Math.max(Math.floor(num / 10).toFixed(0), 0);
  const toStr = 10 - refStr;
  while (str.length < toStr) {
    str = str + '▓';
  }
  while (str.length < 10) {
    str = str + '░';
  }
  return str;
};
const getKB = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes == 0) return '0 Bytes';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2).toFixed(1) + ' ' + sizes[i];
};
