/*
  Since "svh / lvh / dvh" is now common and Safari 15.3 is out of date,
  vh-controller is deprecated.
*/

import Util from '../util';

interface ISize {
  width: number;
  height: number;
}

export default class VhController {
  private isOnlyWidth: boolean = false;
  private refSize: ISize = { width: 0, height: 0 };
  private currentSize: ISize = { width: 0, height: 0 };

  constructor(isOnlyWidth: boolean = false) {
    this.isOnlyWidth = isOnlyWidth;
    const bodyWidth: number = (document.body && document.body.clientWidth) || 0;
    this.currentSize.width = bodyWidth;
    this.currentSize.height = window.innerHeight;

    window.addEventListener('resize', this.onResize, Util.isPassive);
    this.onResize();
  }

  private onResize = (): void => {
    const bodyWidth: number = (document.body && document.body.clientWidth) || 0;

    if (this.isOnlyWidth) {
      if (Util.IS_SP) {
        if (bodyWidth === this.refSize.width) return;
      }
    }

    this.refSize.width = bodyWidth;
    this.refSize.height = window.innerHeight;

    document.documentElement.style.setProperty('--vw', `${this.refSize.width / 100}px`);
    document.documentElement.style.setProperty('--vh', `${this.refSize.height / 100}px`);
  };
}
