/**
 * 
平面上の任意点Pが、曲げるとTに移動するとする

P = (Px, Py, Pz)
T = (Tx, Ty, Tz)

ここで、曲げた結果、紙の長さ・面積が変わらない条件から

Px = 弧TS = Rθ
  θ = Px / R

曲げ後の点Tの座標は以下で求まる

Tx = R * sinθ
Ty = Py
Tz = R - Rcosθ
＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝ */

// fragmentShaderに渡すためのvarying変数
// 処理する頂点ごとのuv(テクスチャ)座標をそのままfragmentShaderに横流しする
// 変換：ローカル座標 → 配置 → カメラ座標
// 変換：カメラ座標 → 画面座標
export const vertexShader = `
  varying vec2 vUv;
  uniform float curlR;
  void main()
  {
    vUv = uv;

    float theta = position.x / curlR;
    float tx = curlR * sin(theta);
    float ty = position.y;
    float tz = curlR * (1.0 - cos(theta));
    vec3 p = vec3(tx, ty, tz);

    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// uniform 変数としてテクスチャのデータを受け取る
// vertexShaderで処理されて渡されるテクスチャ座標
// テクスチャの色情報をそのままピクセルに塗る
export const fragmentShader = `
  uniform sampler2D materialTexture;
  uniform float mixRatio;
  varying vec2 vUv;

  // 色補正 スクロール中
  uniform vec3 color;
  uniform float offset;
  uniform float scrollDirection; // 1.0: 右方向 -1.0: 左方向


  void main()
  {
    vec2 uv = (vUv - 0.5) * 0.9 + 0.5;

    // テクスチャのそれぞれの色成分を取得
    float r = texture2D(materialTexture, uv - vec2(offset * scrollDirection, 0.0)).r;
    float g = texture2D(materialTexture, uv - vec2(offset * scrollDirection * 0.5, 0.0)).g;
    float b = texture2D(materialTexture, uv).b;

    // mixRatioの値に応じて黒色とmix
    // mixRatio=1.0で元の色、mixRatio=0.0で黒色
    vec3 blackColor = vec3(0, 0, 0);
    // vec3 mixedColor = mix(blackColor, textureColor.rgb, mixRatio);
    vec3 mixedColor = mix(blackColor, vec3(r, g, b), mixRatio);

    gl_FragColor = vec4(mixedColor, 1.0);
  }
`;
