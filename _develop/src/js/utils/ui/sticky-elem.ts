/*
Currently it is somehow smarter to do it with gsap.scrollTrigger.
If you want to take the offset for the fixed-header, Specify as follows.

const hedaer = document.querySelector('header');

and

start: () => { return 'top ${ header.offsetHeight }'},


======================================================================
example
======================================================================
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const wrap = document.getElementById('wrap');
const target = document.getElementById('contents');

ScrollTrigger.create({
  trigger: wrap,
  start: 'top top',
  end: () => { return `bottom-=${target!.offsetHeight} top`; },
  pin: target,
  pinSpacing: false,
});
*/
