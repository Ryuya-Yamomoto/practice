const fs = require('fs');
const path = require('path');
const { imageSize } = require('image-size');

function getImageDimension(filePath) {
  try {
    const absolutePath = path.join(process.cwd(), 'src', filePath);
    const buffer = fs.readFileSync(absolutePath);
    const dimensions = imageSize(buffer);
    return dimensions;
  } catch (error) {
    console.error('Error in getImageDimension:', error);
    return { width: 0, height: 0 }; // フォールバック
  }
}

module.exports = {
  nodeFs: fs,
  nodeDest: path.join(process.cwd(), process.env.npm_config_dest || '', process.env.npm_config_sub_directory || ''),
  nodePath: path,
  getImageDimension: getImageDimension,
  doctype: 'html',
};
