import { gsap } from "gsap";

const xValue = 100;
const duration = 1;

export const defaultPlayIn = (el?: HTMLElement, goFrom?: string): Promise<void> => {
  return new Promise((resolve) => {
    gsap.fromTo(
      el,
      {
        autoAlpha: 0,
        x: xValue,
      },
      {
        x: 0,
        autoAlpha: 1,
        duration,
        ease: "power3.inOut",
        onComplete: resolve,
      }
    );
  });
};

export const defaultPlayOut = (el?: HTMLElement, goTo?: string): Promise<void> => {
  return new Promise((resolve) => {
    gsap.fromTo(
      el,
      {
        x: 0,
        autoAlpha: 1,
      },
      {
        autoAlpha: 0,
        x: -xValue,
        duration,
        ease: "power3.inOut",
        onComplete: resolve,
      }
    );
  });
};
