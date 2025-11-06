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

  // alphaの値を取得するgetter
  get alpha(): number {
    return (this.card?.material as THREE.ShaderMaterial)?.uniforms.alpha.value || 0;
  }

  // alphaの値を設定するsetter
  set alpha(value: number) {
    if (this.card) {
      (this.card.material as THREE.ShaderMaterial).uniforms.alpha.value = value;
    }
  }

  constructor(index: number, ITEM_W: number, ITEM_H: number) {
    super();

    const cardTexture = new THREE.TextureLoader().load(`/assets/images/cover_flow/${index}.png`); //- テクスチャの読み込み
    cardTexture.colorSpace = THREE.SRGBColorSpace;

    // シェーダーの準備
    const cardMaterialShaderCurve: THREE.ShaderMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        curlR: { value: 0.0 }, //- シェーダに曲げの半径をuniform変数として渡す
        // alpha: { value: 1.0 }, //- 透明度を指定
        alpha: { value: 1.0 }, //- 透明度を指定
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
