// @ts-ignore
import * as THREE from 'three/webgpu';
import gsap from 'gsap';

import Card from './card';

export default class Depth {
  private readonly URL_BG = '/assets/images/cover_flow/bg.png'; //- 背景画像のパス
  private readonly ITEM_W = 256; //- 平面の横幅
  private readonly ITEM_H = 256; //- 平面の縦幅
  private readonly MARGIN_X = 80; //- 平面のX座標の間隔
  private readonly MAX_SLIDE = 44; //- スライドの個数
  private readonly ANIMATION_DURATION = 1.8; //- アニメーションの時速時間
  private readonly ROTATION_DURATION = 0.9; //- 回転アニメーションの持続時間
  private readonly ANIMATION_EASE = 'expo.out'; //- アニメーションのイージング

  private readonly RADIUS = 1200; //- 円の半径
  private readonly ANGLE_STEP = (2 * Math.PI) / this.MAX_SLIDE; //- 各画像に適用する角度のステップ

  // グローバル変数
  private currentPage = 0; //- 現在のスライドID
  private cards: Card[] = []; //- 平面を格納する配列

  // シーン、カメラ、レンダラー の初期化
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(30);
  private renderer = new THREE.WebGPURenderer({ antialias: true });

  // UI要素の初期化
  private content = document.getElementById('canvasWrapper') as HTMLElement; //- コンテンツエリア
  private slider = document.querySelector('input#rangeSlider') as HTMLInputElement;

  // タッチ操作の状態管理
  private touchStartX = 0;
  private touchStartValue = 0;

  constructor() {
    this.initTHREE();
    this.init();
  }

  // シーン、カメラ、レンダラー 初期化処理
  initTHREE = async () => {
    this.scene.add(this.camera);
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.init();

    // canvasのスタイルを設定（ラッパー内で100%幅、アスペクト比16:9）
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = 'auto';
    this.renderer.domElement.style.aspectRatio = '16 / 9';

    this.content.appendChild(this.renderer.domElement);

    // UI要素 初期化処理
    this.slider.addEventListener('input', this.onSliderChange);

    // イベントリスナーの設定
    this.renderer.domElement.addEventListener('wheel', this.onWheel, { passive: false });
    this.renderer.domElement.addEventListener('touchstart', this.onTouchStart, { passive: true });
    this.renderer.domElement.addEventListener('touchmove', this.onTouchMove, { passive: false });
    window.addEventListener('resize', this.onResize);
  };

  // 初期化処理
  init = async () => {
    // ライトの設定
    const pointLight = new THREE.PointLight(0xffffff, 1000000, 1000);
    pointLight.position.set(0, 0, 500);
    this.scene.add(pointLight);

    // カードの生成
    for (let i = 0; i < this.MAX_SLIDE; i++) {
      const card = new Card(i, this.ITEM_W, this.ITEM_H);
      this.scene.add(card);
      this.cards[i] = card;
    }

    // カメラの位置設定
    this.camera.position.z = 1200;
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // 背景の生成
    const bgTexture = new THREE.TextureLoader().load(this.URL_BG);
    bgTexture.colorSpace = THREE.SRGBColorSpace;
    const meshBg = new THREE.Mesh(new THREE.PlaneGeometry(3000, 1000), new THREE.MeshBasicMaterial({ map: bgTexture }));
    meshBg.position.z = -500;
    this.scene.add(meshBg);

    // 初期表示
    this.moveSlide(this.MAX_SLIDE / 2);
    this.onResize();
    this.tick();
  };

  /**
   * マウスホイールイベントハンドラー
   * @param {WheelEvent} event - ホイールイベント
   */
  onWheel = (event: WheelEvent) => {
    this.slider.valueAsNumber += event.deltaY * 0.0005;
    this.onSliderChange();
    event.preventDefault();
  };

  /**
   * タッチ開始イベントハンドラー
   * @param {TouchEvent} event - タッチイベント
   */
  onTouchStart = (event: TouchEvent) => {
    if (event.target === this.slider) return;
    this.touchStartX = event.touches[0].clientX;
    this.touchStartValue = this.slider.valueAsNumber;
  };

  /**
   * タッチ移動イベントハンドラー
   * @param {TouchEvent} event - タッチイベント
   */
  onTouchMove = (event: TouchEvent) => {
    if (event.target === this.slider) return;

    const touchX = event.touches[0].clientX;
    const deltaX = touchX - this.touchStartX;

    // 1スライド分の移動に必要なピクセル数（カード幅の0.7倍で調整）
    const slidePixel = this.ITEM_W * 0.7;

    this.slider.valueAsNumber = Math.max(0, Math.min(1, this.touchStartValue - deltaX / (slidePixel * (this.MAX_SLIDE - 1))));
    this.onSliderChange();

    event.preventDefault();
  };

  /**
   * スライダー変更イベントハンドラー
   */
  onSliderChange = () => {
    const nextId = Math.round(this.slider.valueAsNumber * (this.MAX_SLIDE - 1));
    this.moveSlide(nextId);
  };

  /**
   * スライドを移動
   * @param {number} id - 移動先のスライドID
   */
  moveSlide = (id: number) => {
    if (this.currentPage === id) return;

    this.cards.forEach((card, i) => {
      const { x: targetX, y: targetY, z: targetZ, rotation: targetRot } = this.calculateCardPosition(i, id);

      gsap.to((card as THREE.Object3D).position, {
        x: targetX,
        y: targetY,
        z: -1 * targetZ,
        duration: this.ANIMATION_DURATION,
        ease: this.ANIMATION_EASE,
        overwrite: true,
      });

      gsap.to((card as THREE.Object3D).rotation, {
        y: targetRot,
        duration: this.ROTATION_DURATION,
        ease: this.ANIMATION_EASE,
        overwrite: true,
      });
    });

    this.currentPage = id;
  };

  /**
   * カードの位置と回転を計算
   * @param {number} index - カードのインデックス
   * @param {number} targetId - 目標のスライドID
   * @returns {{x: number, z: number, rotation: number}} カードの位置と回転情報
   */
  calculateCardPosition = (index: number, targetId: number) => {
    // 現在のカードとターゲットカードのインデックス差を計算
    let indexDiff = index - targetId;

    // 円形配置での最短距離を考慮
    const distance = Math.min(Math.abs(indexDiff), this.MAX_SLIDE - Math.abs(indexDiff));

    // Z座標を距離に基づいて計算
    const depthStep = this.RADIUS / (this.MAX_SLIDE / 2);
    const targetZ = depthStep * distance;

    // 角度を計算
    const angle = this.ANGLE_STEP * indexDiff;

    // X座標を円周上に配置
    const targetX = this.RADIUS * Math.sin(angle);

    // Y座標をZ値に基づいて計算（アクティブは-50、奥ほど-1に近づく）
    const targetY = distance === 0 ? -50 : 600 * (distance / (this.MAX_SLIDE / 2)) - 50;

    // 回転は常に0に設定（正面を向く）
    const targetRot = 0;

    return { x: targetX, y: targetY, z: targetZ, rotation: targetRot };
  };

  /**
   * リサイズイベントハンドラー
   */
  onResize = () => {
    // ラッパー要素のサイズを取得
    const wrapperWidth = this.content.clientWidth;
    // アスペクト比 16:9 で高さを計算（横長）
    const wrapperHeight = wrapperWidth * (9 / 16);

    this.renderer.setSize(wrapperWidth, wrapperHeight);
    // canvasは16:9の横長、カメラのアスペクト比でカード形状を制御
    this.camera.aspect = wrapperWidth / wrapperHeight; // canvasのアスペクト比に合わせる
    this.camera.updateProjectionMatrix();
  };

  /**
   * アニメーションループ
   */
  tick = () => {
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.tick);
  };
}
