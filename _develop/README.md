# Template

## Introduction

見やすい web 版: http://backlog.caters.jp:8969/backlog/git/FRONTEND/FrontEndTemplate-v2/blob/master/_develop/README.md

## 環境

- npm&node

  volta(https://volta.sh/) に従う

## フロントエンド制作

- pug
  https://pugjs.org/api/getting-started.html

### CSS

- PostCSS

### Javascript

- es Next / React

---

### 使い方

#### インストール

```
npm install
npm install -g typescript
```

#### ウォッチ開始

```
npm start
```

#### 簡易ビルド

```
npm run build
```

速度を確保するためフルビルドとは分けています。
基本 watch で確認後に build で納品用が出来ます。

#### フルビルド

```
npm run build:all
```

watch を経由せず完全な納品用ファイルをいきなり作る場合はこちら

#### 固有パッケージの導入には --save-dev を付けて下さい。

```
npm install *** --save-dev
```

---

## config

- 書き出し先のパスを設定します。

  場所は、package.json -> config
  基本的に変更の必要は無いですが、public_html を htdocs にしたり、

  assets を common にしたりは臨機応変に。

  サブディレクトリがある場合 `例）***.com/directory/` も同場所で。

- postCSS の vw や rem 等の基準になる値を、`postcss.config`で調整

- あとは
  `npm install` -> `npm start` で watch。
  十分になったら、
  `npm run build`
  アップロード前には必ず build してください。

- icon-font `_develop/src/css/_config/_fonts.css` は、

  `src/assets/fonts/`に svg を保存し、

  `npm run build:icon`を手動実行してください。

  (watch すると毎回 hash が変わってしまうため、マニュアル制御にしました。)

- 画像は
  `src/images/` 内へ。

  その内部はそのまま public_html/assets/images 内にコピーされます。

- 静的ファイル（JSON、ico 等）は全て、
  `src/static_files/` 内へ。

  その内部はそのまま public_html/assets/内にコピーされます。
  特例でルートに置きたい場合のみ(favicon.ico など) 直接 `public_html` において下さい。

---

## webP 画像

`config.enableWebP`を`true`に。自動で webP が書き出されるようになります。

その後 pug では平常通り `+img()`, `+pic()`を使用すると非対応ブラウザへのフォールバックが自動で出されます。

例）

```
 +img('images/test.png')
```

自動変換後）

```
 picture(class=attributes.class)
  source(srcset='/assets/images_min/test.webp', type='image/webp')
    img(src='/assets/images/test.png', alt=alt)
```

感覚的には今までと同じ指定で自動で webP 対応出来るイメージ

---

## タブレット版 CSS を作る場合

1. `_media.css`の【2】or【3】番を使います（【2】が良さそうかも）
2. `postcss.config`の`tbDesignWidth`を設定します。
   大体ここからここを基準にするみたいな幅入れとくといいです。
   （例 デザイン上のコンテンツピタピタの幅＋余白に左右にテキトウに追加したくらいの幅
3. pc の css 名を、 `*_pc.css` という名前で作る。これが変換対象になる。
4. \*\_pc.css を保存すると同名\_tb.css が書き出される。あとは pc の css に普通に import してしまえば良い。
5. こんな感じにすると良いです。

```
css/
  ├ modules/
  │  ├ _index_pc.css
  │  ├ _index_tb.css
  │  └ _index_sp.css
  └ index.css
```

6. device-watcher.css の SP に切り替わるポイントを media.css で設定した値に揃えよう。

---

## GSAP Shockingly Plugins

1. クライアントにソースコードを渡さない案件である事を確認する（ライセンスの関係）。
   もし渡す必要があるならば、web フォントのようにクライアントで契約して貰う形になる。

2. Mac : `~/.npmrc` / Win `C:\Users\%username%\.npmrc`　を作成
3. 2)に下記をペースト

```
//npm.greensock.com/:_authToken=e488b143-d605-43bb-8a8a-16bc09042bbd
@gsap:registry=https://npm.greensock.com
```

4. `npm install gsap@npm:@gsap/shockingly` を実行
5. 有料プラグインが使えるようになります。

例）scrollSmoother

```
import gsap from 'gsap';
import { ScrollSmoother, ScrollTrigger } from 'gsap/all';
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

ScrollSmoother.create({
  smooth: 1,
  effects: true
});
```

```
【pug】
#smooth-wrapper
 #smooth-content
```

scrollSmoother と scrollTrigger の組み合わせがかなり強力です。

---

## React

```
npm install react react-dom @types/react @types/react-dom --save-dev
```

拡張子は `*.jsx or *.tsx`

```
【pug】
#app
```

```
【app.tsx】
export default class Sample {
  constructor() {
    const container = document.getElementById('app');
    if (container) {
      const root = createRoot(container);
      root.render(<App />);
    }
  }
}

const App = () => {
  return (
    <div>This is React</div>
  )
}
```
