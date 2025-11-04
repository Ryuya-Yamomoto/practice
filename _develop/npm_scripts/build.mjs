import * as esbuild from 'esbuild';
import process from 'node:process';

import paths from '../paths.cjs';
import colors from './colors.cjs';
import { rimrafSync } from 'rimraf';

rimrafSync(`${paths.appBuild}/${paths.subDirectory}${paths.assetPath}/js`);

const rootPath = '/';

const ctx = await esbuild.context({
  bundle: true,
  entryNames: '[name]',
  entryPoints: ['./src/js/main.ts'],
  format: 'esm',
  legalComments: 'eof',
  minify: true,
  outdir: `${paths.appBuild}/${paths.assetPath}/js`,
  platform: 'browser',
  publicPath: `${rootPath}${paths.subDirectory}${paths.assetPath}/js`,
  sourcemap: process.env.NODE_ENV === 'development' ? 'inline' : false,
  splitting: true,
  target: ['esnext', 'safari15'],
  treeShaking: true,
});

await ctx.rebuild();

const noticeMessage = `${colors.redBg}${colors.black}   esBuild Done.   ${colors.reset}`;
console.log(noticeMessage);
ctx.dispose();
