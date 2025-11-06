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
// export const vertexShader = `
//   varying vec2 vUv;
//   uniform float curlR;
//   uniform float curlAngle;
//   void main()
//   {
//     vUv = uv;

//     // 円弧配置の角度に基づいて曲げ方向を決定
//     float cosAngle = cos(curlAngle);
//     float sinAngle = sin(curlAngle);

//     // 角度に応じて曲げる軸を回転
//     // X軸方向の曲げをcurlAngleで回転させる
//     float localX = position.x * cosAngle - position.z * sinAngle;
//     float localZ = position.x * sinAngle + position.z * cosAngle;

//     float theta = localX / curlR;
//     float tx = curlR * sin(theta);
//     float ty = position.y;
//     float tz = curlR * (1.0 - cos(theta));

//     // 曲げた結果を元の座標系に戻す
//     float finalX = tx * cosAngle + tz * sinAngle;
//     float finalZ = -tx * sinAngle + tz * cosAngle + localZ;

//     vec3 p = vec3(finalX, ty, finalZ);

//     vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
//     gl_Position = projectionMatrix * mvPosition;
//   }
// `;

// uniform 変数としてテクスチャのデータを受け取る
// vertexShaderで処理されて渡されるテクスチャ座標
// テクスチャの色情報をそのままピクセルに塗る
export const fragmentShader = `
  uniform sampler2D materialTexture;
  uniform float alpha;
  uniform float scale;
  varying vec2 vUv;

  void main()
  {
    // vec4 color = mix(texture2D(materialTexture, vUv), vec4(vUv, 0.0, 1.0), 0.5);

    // gl_FragColor = texture2D(materialTexture, fract(vUv * 2.0));
    // gl_FragColor = vec4(fract(vUv * 2.0), 0.0, 1.0);
    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    // gl_FragColor = color;

    // テクスチャの色を取得
    vec4 textureColor = texture2D(materialTexture, vUv);
    
    // alphaの値に応じて黒色とmix
    // alpha=1.0で元の色、alpha=0.0で黒色
    vec3 blackColor = vec3(0.0, 0.0, 0.0);
    vec3 mixedColor = mix(blackColor, textureColor.rgb, alpha);
    
    // 透過度もalphaで制御（黒くなるほど透明にもなる）
    gl_FragColor = vec4(mixedColor, textureColor.a);
  }
`;
