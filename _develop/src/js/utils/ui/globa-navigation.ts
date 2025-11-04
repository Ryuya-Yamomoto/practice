/*
  あくまで基本形。基本的にはデザインに準ずる。

  【pug ==========================================】
  header.header
    p.global-navigation__trigger.only-sp#global-navigation-trigger

  nav.global-navigation#global-navigation
    .global-navigation__inner
      ul.global-navigation__list
        li.global-navigation__list-item
          a(href="/") リンク1

  【css（例） ==========================================】
    $header-height: vw(90);

    .root {
      padding-top: $header-height;
    }

    .header {
      position: fixed;
      left: 0;
      top: 0;
      width: 100%;
      height: $header-height;
      background-color: #ccc;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      padding: 0 vw(30);
    }

    .global-navigation__trigger {
      e.g.
      http://matsumoto.sample.caters.jp/menu-creator/
    }

    .global-navigation {
      position: absolute;
      left: 0;
      top: 100%;
      width: 100%;
      height: 0;
      background-color: #fff;
      transition: height 0.3s ease-out;
      box-sizing: border-box;
      overflow: hidden;

      &.active {
        height: calc(vh(100, fix) - $header-height);
      }

      &__inner {
        box-sizing: border-box;
        height: calc(vh(100, fix) - $header-height);
        padding: vw(30);
        overflow: hidden;
        overflow-y: scroll;
      }

      &__list {
        &-item {
          a.active {
            opacity: 0.3;
            pointer-events: none;
          }
        }
      }
    }

  【note ==========================================】
  .global-navigation__trigger
  .global-navigation
  .global-navigation a でパスにマッチするもの

  にactiveが付く。
*/

/**
 * SPグローバルナビゲーション。多用が過ぎるのでテンプレートに入れておきます。
 * @export
 * @class GlobalNavigation
 */
export default class GlobalNavigation {
  private trigger: HTMLElement | null = document.getElementById('global-navigation-trigger');
  private navigation: HTMLElement | null = document.getElementById('global-navigation');
  private isOpen: boolean = false;
  private anchors: HTMLAnchorElement[] = [];

  constructor() {
    if (this.trigger) {
      this.trigger.addEventListener('click', this.toggle, { passive: false });
    }

    if (this.navigation) {
      this.anchors = Array.from(this.navigation.querySelectorAll('a'));
      for (const anchor of this.anchors) {
        anchor.addEventListener('click', this.close, { passive: false });
      }
    }

    const pathName: string = window.location.pathname;

    for (const anchor of this.anchors) {
      if (anchor.getAttribute('href') === pathName) {
        anchor.classList.add('active');
      }
    }
  }

  private toggle = (): void => {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.open();
    } else {
      this.close();
    }
  };

  private open = (): void => {
    if (this.trigger) this.trigger.classList.add('active');
    if (this.navigation) this.navigation.classList.add('active');
  };

  private close = (): void => {
    this.isOpen = false;
    if (this.trigger) this.trigger.classList.remove('active');
    if (this.navigation) this.navigation.classList.remove('active');
  };
}
