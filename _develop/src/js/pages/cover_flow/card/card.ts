// @ts-ignore
import * as THREE from 'three/webgpu';

/**
 * カバーフローのカードクラス
 */
export default class Card extends THREE.Object3D {
  constructor(index: number, ITEM_W: number, ITEM_H: number) {
    super();

    const texture = new THREE.TextureLoader().load(`/assets/images/cover_flow/${index}.png`);
    texture.colorSpace = THREE.SRGBColorSpace;

    // アスペクト比1:1を保つために、最小値を使用
    const cardSize = Math.min(ITEM_W, ITEM_H);

    // 上面
    const material = new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    const planeTop = new THREE.Mesh(new THREE.PlaneGeometry(cardSize, cardSize), material);
    (this as THREE.Object3D).add(planeTop);

    // 反射面
    const materialOpt = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
      side: THREE.BackSide,
      opacity: 0.2,
    });
    const planeBottom = new THREE.Mesh(new THREE.PlaneGeometry(cardSize, cardSize), materialOpt);
    planeBottom.rotation.y = Math.PI;
    planeBottom.rotation.z = Math.PI;
    planeBottom.position.y = -cardSize - 1;
    (this as THREE.Object3D).add(planeBottom);
  }
}
