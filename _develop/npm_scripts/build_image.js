const fs = require('fs');
const path = require('path');
const cpx = require('cpx');
const paths = require('../paths.cjs');
const sharp = require('sharp');
const colors = require('./colors.cjs');
sharp.cache(false);

const isWebP = process.env.npm_config_enable_webp;
const srcDir = `${paths.appSrc}images/**/**`;
const destDir = `${paths.appBuild}/${paths.assetPath}/images/`;
const webpDir = `${paths.appBuild}/${paths.assetPath}/images_min/`;

let total = 0;

if (fs.existsSync(destDir)) {
  fs.rmdirSync(destDir, { recursive: true });
}
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
  console.log(`Created directory: ${destDir}`);
}

console.log(`\n${colors.cyanBg}${colors.black} Copy images please wait... ${colors.reset}\n`);
cpx.copy(srcDir, destDir, { update: true, clean: true }, (err) => {
  if (isWebP) {
    if (fs.existsSync(webpDir)) {
      fs.rmdirSync(webpDir, { recursive: true });
    }
    if (!fs.existsSync(webpDir)) {
      fs.mkdirSync(webpDir, { recursive: true });
    }
    cpx.copy(`${srcDir}/*.{png,jpg}`, webpDir, { clean: true }, (err) => {
      launchBuild();
    });
  } else {
    launchBuild();
  }
});

const getKB = (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes == 0) return '0 Bytes';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2).toFixed(1) + ' ' + sizes[i];
};

/* =================================================================== */
const compressImage = async (filePath) => {
  const fileInfo = path.parse(filePath);
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
  } else {
    saved = 0;
    console.log(`${colors.blueBg}${colors.black} Skip ${colors.reset} ${colors.gray}${path.relative(destDir, filePath)}${colors.reset}`);
  }
};

const processDirectory = async (dirPath) => {
  const files = await fs.promises.readdir(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      await processDirectory(filePath);
    } else if (file.match(/\.(jpg|jpeg|png)$/i)) {
      await compressImage(filePath);
    }
  }
};

/* - * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = */

const launchBuild = async () => {
  console.clear();
  console.log(`\n${colors.cyanBg}${colors.black} Start compressing images... ${colors.reset}\n`);
  console.log(`12.5%以上圧縮出来る場合は適用しますが低い場合効果が薄いのでパスします。`);
  console.log(`If compression is possible by 12.5% or more, apply it. otherwise, skip it.\n`);

  try {
    await processDirectory(destDir);
    console.log(`\n${colors.greenBg}${colors.black} All image compress complete. ${colors.reset}\n`);

    if (isWebP) {
      createWebP();
    }
  } catch (err) {
    console.error(err);
  }
};

/* - * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = * = */
const launchWebP = async (filePath) => {
  const fileInfo = path.parse(filePath);
  const inputBuffer = await fs.promises.readFile(filePath);
  const beforeSize = inputBuffer.byteLength;

  const targetPath = filePath.replace(/\.jpg$|\.jpeg$|\.png$/g, '.webp');
  const outputBuffer = await sharp(inputBuffer).webp({ quality: 70, effort: 4 }).toFile(targetPath);
  const afterBuffer = await fs.promises.readFile(targetPath);
  const afterSize = afterBuffer.byteLength;

  total += beforeSize - afterSize;

  let saved = ((beforeSize - afterSize) / beforeSize) * 100;
  saved = Math.max(0, saved);

  fs.rmSync(filePath, { force: true });

  console.log(
    `${colors.redBg}${colors.black} WebP: ${getNumStr(saved.toFixed(1))}% ${colors.reset} ${colors.cyan}${getGraphStr(saved)}${
      colors.reset
    } ${colors.reset}${getKB(beforeSize)}${colors.green} => ${colors.reset}${getKB(afterSize)} ${colors.gray}${path
      .relative(destDir, filePath)
      .replace(/\.jpg$|\.jpeg$|\.png$/g, '.webp')}${colors.reset}`,
  );
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

const processDirectoryWebP = async (dirPath) => {
  const files = await fs.promises.readdir(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isDirectory()) {
      await processDirectoryWebP(filePath);
    } else if (file.match(/\.(jpg|jpeg|png)$/i)) {
      await launchWebP(filePath);
    }
  }
};

const createWebP = async () => {
  total = 0;
  console.log(`\n${colors.cyanBg}${colors.black} create webP images... ${colors.reset}\n`);

  try {
    await processDirectoryWebP(webpDir);
    console.log(`\n${colors.greenBg}${colors.black} create webP complete. ${colors.reset}\n`);
    console.log(`\n${colors.cyanBg}${colors.black} total:${getKB(total)} saved.${colors.reset} 🎉\n`);
  } catch (err) {
    console.error(err);
  }
};
