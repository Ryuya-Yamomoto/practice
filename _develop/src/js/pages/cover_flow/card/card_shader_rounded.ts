// @ts-ignore
// import * as THREE from 'three/webgpu';
import * as THREE from 'three';
import { vertexShader, fragmentShader } from '../shader/shader_shader_rounded';

/**
 * カバーフローのカードクラス
 */
export default class CardShaderRounded extends THREE.Object3D {
  private card: THREE.Mesh | null = null;

  // テクスチャへのアクセサを追加
  get texture(): THREE.Texture | null {
    return (this.card?.material as THREE.MeshBasicMaterial)?.map || null;
  }

  // curlRの値を取得するgetter
  get curlR(): number {
    return (this.card?.material as THREE.ShaderMaterial)?.uniforms.curlR.value || 0;
  }

  // curlRの値を設定するsetter
  set curlR(value: number) {
    if (this.card) {
      (this.card.material as THREE.ShaderMaterial).uniforms.curlR.value = value;
    }
  }

  // mixRatioの値を取得するgetter
  get mixRatio(): number {
    return (this.card?.material as THREE.ShaderMaterial)?.uniforms.mixRatio.value || 0;
  }

  // mixRatioの値を設定するsetter
  set mixRatio(value: number) {
    if (this.card) {
      (this.card.material as THREE.ShaderMaterial).uniforms.mixRatio.value = value;
    }
  }

  // colorの値を取得するgetter
  get color(): THREE.Color {
    return (this.card?.material as THREE.ShaderMaterial)?.uniforms.color.value || new THREE.Color(0.0, 0.0, 0.0);
  }

  // colorの値を設定するsetter
  set color(value: THREE.Color) {
    if (this.card) {
      (this.card.material as THREE.ShaderMaterial).uniforms.color.value = value;
    }
  }

  // offsetの値を取得するgetter
  get offset(): number {
    return (this.card?.material as THREE.ShaderMaterial)?.uniforms.offset.value || 0;
  }

  // offsetの値を設定するsetter
  set offset(value: number) {
    if (this.card) {
      (this.card.material as THREE.ShaderMaterial).uniforms.offset.value = value;
    }
  }

  // scrollDirectionの値を取得するgetter
  get scrollDirection(): number {
    return (this.card?.material as THREE.ShaderMaterial)?.uniforms.scrollDirection.value || 0;
  }

  // scrollDirectionの値を設定するsetter
  set scrollDirection(value: number) {
    if (this.card) {
      (this.card.material as THREE.ShaderMaterial).uniforms.scrollDirection.value = value;
    }
  }

  constructor(index: number, ITEM_W: number, ITEM_H: number) {
    super();

    const cardTexture = new THREE.TextureLoader().load(`/engineer/yamamoto/practice/assets/images/cover_flow/${index}.png`); //- テクスチャの読み込み
    cardTexture.colorSpace = THREE.SRGBColorSpace;

    // シェーダーの準備
    const cardMaterialShaderCurve: THREE.ShaderMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        curlR: { value: 0.0 }, //- シェーダに曲げの半径をuniform変数として渡す
        mixRatio: { value: 1.0 }, //- 黒色のテクスチャーとの混合比率
        color: { value: new THREE.Color(0.0, 0.0, 0.0) }, //- スクロール中の色指定
        offset: { value: 0.0 }, //- スクロールの進捗率における色をずらすためのオフセット値
        scrollDirection: { value: 0.0 }, //- スクロール方向 0.0: 右方向 1.0: 左方向
        materialTexture: { value: cardTexture }, //- WebGPU版では type 指定不要
      },
    });
    cardMaterialShaderCurve.side = THREE.DoubleSide; //- 両面描画する
    cardMaterialShaderCurve.transparent = true; //- 透過、半透過の指定
    cardMaterialShaderCurve.blending = THREE.NormalBlending; //- ブレンディングの指定

    const cardGeometry = new THREE.PlaneGeometry(ITEM_W, ITEM_H, ITEM_W / 8, ITEM_H / 8); //- ジオメトリの作成
    // const cardMaterial = new THREE.MeshBasicMaterial({ map: cardTexture }); //- 標準のマテリアルを作成
    // cardMaterial.side = THREE.DoubleSide; //- 両面描画する
    // cardMaterial.transparent = true; //- 透過、半透過の指定
    // cardMaterial.blending = THREE.NormalBlending; //- ブレンディングの指定

    // this.card = new THREE.Mesh(cardGeometry, cardMaterial); //- ジオメトリとマテリアルからメッシュ（シェーディングまで含んだ3Dオブジェクト）の作成
    this.card = new THREE.Mesh(cardGeometry, cardMaterialShaderCurve); //- ジオメトリとマテリアルからメッシュ（シェーディングまで含んだ3Dオブジェクト）の作成
    this.card.position.set(0, 0, -5); //- メッシュの位置を設定
    (this as THREE.Object3D).add(this.card); //- カードオブジェクトにメッシュを追加
  }
}
