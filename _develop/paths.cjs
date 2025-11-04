/**  ↓--------------------------------↓
このファイルは弄らないです。
パスの設定はpackage.jsonのconfigにあります
↑------------------------------------↑*/

const path = require('path');

const dest = `${process.env.npm_config_dest}/`;

const subDirectory = process.env.npm_config_sub_directory;

const assetPath = process.env.npm_config_asset_path;

module.exports = {
  appDest: dest,
  appBuild: path.resolve(`${dest}${subDirectory}`),
  appSrc: path.resolve('src') + '/',
  subDirectory,
  assetPath,
};
