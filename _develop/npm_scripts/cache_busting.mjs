import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import fetch from 'node-fetch';
import { Parser as HtmlParser } from 'htmlparser2';
import colors from './colors.cjs';
import paths from '../paths.cjs';

const extractAssetUrlsFromHtml = (html) => {
  return new Promise((resolve, reject) => {
    const assetUrls = [];
    const parser = new HtmlParser({
      onopentag(tagName, attrs) {
        if (tagName !== 'a') {
          if (attrs.src) assetUrls.push(attrs.src);
          if (attrs.href) assetUrls.push(attrs.href);
        }
      },
      onend() {
        resolve(Array.from(new Set(assetUrls)));
      },
      onerror: reject,
    });
    parser.parseComplete(html);
  });
};

const extractFileNameFromUrl = (url) => {
  return url.split('?')[0].split('#')[0];
};

const mergeRootWithFileName = (root, fileName) => {
  return path.join(root, fileName);
};

const readFile = (fileName) => {
  return fs.readFile(fileName, 'utf-8');
};

const createSRIHash = (contents, algorithm = 'sha384') => {
  return `${algorithm}-${crypto.createHash(algorithm).update(contents).digest('base64')}`;
};

const fetchExternalResource = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    return await response.text();
  } catch (err) {
    console.error(`Error fetching external resource: ${url}`, err);
    throw err;
  }
};

const removeQueryParams = (url) => {
  // URLからクエリパラメータを削除する（?以降を削除）
  const [baseUrl] = url.split('?');
  return baseUrl;
};

const cacheBustHtml = async (html, assetsRoot, options = {}) => {
  if (!assetsRoot) throw new Error('The asset root cannot be null or undefined');
  const isSRI = process.env.npm_config_is_sri === 'true';

  const assetUrls = await extractAssetUrlsFromHtml(html);

  const fingerPrints = await Promise.all(
    assetUrls.map(async (assetUrl) => {
      try {
        let fileContents;
        let isExternal = false;

        // Google Fontsのリソースは無視
        if (assetUrl.includes('fonts.googleapis.com') || assetUrl.includes('fonts.gstatic.com')) {
          return null;
        }

        if (assetUrl.startsWith('http://') || assetUrl.startsWith('https://')) {
          // 外部リソースの処理
          isExternal = true;
          if (!assetUrl.startsWith('https://')) throw new Error(`Non-HTTPS external URL: ${assetUrl}`);
          fileContents = await fetchExternalResource(assetUrl);
        } else {
          // ローカルリソースの処理
          const fileName = extractFileNameFromUrl(assetUrl);
          const fullPath = mergeRootWithFileName(assetsRoot, fileName);
          fileContents = await readFile(fullPath);
        }

        // ファイルハッシュ生成（キャッシュバスティング用）
        const hash = createSRIHash(fileContents);

        // キャッシュバスティングURL: 外部リソースはそのまま
        const cacheBustedUrl = isExternal ? assetUrl : `${assetUrl}?v=${hash}`;

        // SRI情報を外部リソースかつisSRI=trueの場合のみ付加
        return {
          original: assetUrl,
          integrity: isExternal && isSRI ? hash : null,
          cacheBustedUrl: cacheBustedUrl,
          crossorigin: isExternal && isSRI ? 'anonymous' : null,
          isForSRI: isExternal && isSRI && (assetUrl.endsWith('.js') || assetUrl.endsWith('.css')),
        };
      } catch (err) {
        if (options.logger) options.logger(err);
        return null;
      }
    }),
  );

  const validFingerPrints = fingerPrints.filter(Boolean);

  return validFingerPrints.reduce((updatedHtml, { original, integrity, cacheBustedUrl, crossorigin, isForSRI }) => {
    return updatedHtml.replace(new RegExp(`(<[^>]*${original}[^>]*>)`, 'g'), (match) => {
      if (isForSRI) {
        // SRI + キャッシュバスティング
        const integrityAttr = integrity ? ` integrity="${integrity}"` : '';
        const crossoriginAttr = crossorigin ? ` crossorigin="${crossorigin}"` : '';
        return match.replace(original, cacheBustedUrl).replace('>', `${integrityAttr}${crossoriginAttr}>`);
      } else {
        // 通常のキャッシュバスティング（外部リソースは変更なし）
        return match.replace(original, cacheBustedUrl);
      }
    });
  }, html);
};

const readSubDirSync = async (folderPath) => {
  const result = [];

  const readTopDirSync = async (folderPath) => {
    const items = await fs.readdir(folderPath);
    const itemPaths = items.map((itemName) => path.join(folderPath, itemName));

    for (const itemPath of itemPaths) {
      result.push(itemPath);
      const stat = await fs.stat(itemPath);
      if (stat.isDirectory()) {
        await readTopDirSync(itemPath);
      }
    }
  };

  await readTopDirSync(folderPath);
  return result;
};

const processFiles = async () => {
  try {
    const files = await readSubDirSync(paths.appDest);
    const htmlFiles = files.filter((file) => file.endsWith('.html'));

    await Promise.all(
      htmlFiles.map(async (file) => {
        try {
          const html = await fs.readFile(file, 'utf-8');
          const cacheBustedHtml = await cacheBustHtml(html, paths.appDest);
          await fs.writeFile(file, cacheBustedHtml);
        } catch (error) {
          console.log(`Error processing file ${file}:`, error);
        }
      }),
    );

    console.log(`${colors.cyanBg}${colors.black}  Cache Busting Complete  ${colors.reset}`);
  } catch (error) {
    console.log('Error during file processing:', error);
  }
};
processFiles();
