/* ===================================================================
Now it can be done only with CSS.
Only on older iOS(15.x), it is displayed without animation like "detail-summary",
but there is no problem to view.

[pug]
.accordion
  label.accordion__trigger
    input(type="checkbox", hidden)
    | trigger
  .accordion__target
    .accordion__inner
      | contents

[css]
.accordion {
  &__inner {
    overflow: hidden;
  }

  &__target {
    display: grid;
    grid-template-rows: 0fr;
    transition: 0.3s grid-template-rows ease;
  }

  &__trigger {
    &:has(input[type='checkbox']:checked) {
      ~ .accordion__target {
        grid-template-rows: 1fr;
      }
    }
  }
}


[pug with mixin example]

//-  accordion mixin
mixin accordion(triggerName)
  .accordion
    label.accordion__trigger
      input(type="checkbox", hidden)
      | #{triggerName}
    .accordion__target
      .accordion__inner
        block

//-  Examples of Use
+accordion('toggle Accordion')
  h1 innerCaption
  p innerText


===================================================================
Deprecated
===================================================================
【pug】
.accordion
  .accordion__trigger(開閉ボタン。.activeが付いたり消えたり)
  .accordion__target
    .accordion__inner

【css】
.accordion {
  box-sizing: border-box;
  position: relative;
  &__trigger {
    cursor: pointer;
    &.active {
      active時
    }
  }
  &__target {
    overflow: hidden;
    height: 0;
    box-sizing: border-box;
  }
}

===================================================================
import gsap from 'gsap';
import Util from '../util';


export default class Accordion {
  private accordionInstance: AccordionElem[] | null = [];

  constructor() {
    const accordionList: HTMLElement[] = Array.prototype.slice.call(document.getElementsByClassName('accordion'));
    for (const accordion of accordionList) {
      if (this.accordionInstance) {
        this.accordionInstance.push(new AccordionElem(accordion));
      }
    }
  }

  public destroy = (): void => {
    if (!this.accordionInstance) return;
    for (const elem of this.accordionInstance) {
      elem.destroy();
    }
    this.accordionInstance = [];
  };
}


class AccordionElem {
  private isOpen: boolean = false;
  private trigger: HTMLElement | null;
  private wrapper: HTMLElement | null;
  private inner: HTMLElement | null;

  constructor(node: HTMLElement) {
    this.trigger = Array.prototype.slice.call(node.getElementsByClassName('accordion__trigger'))[0];
    this.wrapper = Array.prototype.slice.call(node.getElementsByClassName('accordion__target'))[0];
    this.inner = Array.prototype.slice.call(node.getElementsByClassName('accordion__inner'))[0];

    if (!this.trigger || !this.wrapper || !this.inner) {
      Util.warn('nullCheckError: accordion.ts : line58');
      return;
    }

    this.trigger.addEventListener('click', this.toggle, false);
  }

  private toggle = (): void => {
    if (!this.trigger || !this.wrapper || !this.inner) {
      return;
    }
    this.isOpen = !this.isOpen;
    gsap.killTweensOf(this.wrapper);

    if (this.isOpen) {
      this.trigger.classList.add('active');
      const toHeight: number = this.inner.offsetHeight;
      gsap.to(this.wrapper, 0.4, { height: toHeight, ease: 'power1.out' });
    } else {
      this.trigger.classList.remove('active');
      gsap.to(this.wrapper, 0.4, { height: 0, ease: 'power1.in' });
    }
  };

  public destroy = (): void => {
    if (!this.trigger || !this.wrapper || !this.inner) {
      return;
    }

    this.trigger.removeEventListener('click', this.toggle);
    this.trigger.classList.remove('active');
    gsap.killTweensOf(this.wrapper);
    this.wrapper.removeAttribute('style');

    this.trigger = null;
    this.wrapper = null;
    this.inner = null;
  };
}
=================================================================== */
