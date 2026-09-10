import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const animateStaggerIn = (targets, options = {}) => {
  const {
    delay = 0.1,
    duration = 0.6,
    stagger = 0.08,
    y = 25,
    ease = 'power2.out',
    scrollTrigger = null,
  } = options;

  return gsap.from(targets, {
    opacity: 0,
    y,
    duration,
    delay,
    stagger,
    ease,
    scrollTrigger,
    clearProps: 'transform,opacity',
  });
};

export const animateHeroEntrance = (refs) => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (refs.heading) {
    tl.from(refs.heading, { opacity: 0, y: 30, duration: 0.7 });
  }
  if (refs.subtitle) {
    tl.from(refs.subtitle, { opacity: 0, y: 20, duration: 0.5 }, '-=0.4');
  }
  if (refs.features) {
    tl.from(refs.features, { opacity: 0, y: 20, stagger: 0.1, duration: 0.5 }, '-=0.3');
  }
  if (refs.cta) {
    tl.from(refs.cta, { opacity: 0, scale: 0.95, duration: 0.4 }, '-=0.2');
  }
  if (refs.card) {
    tl.from(refs.card, { opacity: 0, x: 30, duration: 0.7, ease: 'power2.out' }, '-=0.6');
  }

  return tl;
};

export const floatElement = (target, yDistance = 8, duration = 3) => {
  return gsap.to(target, {
    y: `-=${yDistance}`,
    duration,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
};

export default gsap;
