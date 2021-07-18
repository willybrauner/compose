import { gsap } from "gsap";
import debugModule from "debug";
const debug = debugModule(`front:defaultTransitions`);

const xValue = 100;
const duration = 1;

export const defaultPlayIn = (el?: HTMLElement, goFrom?: string): Promise<void> => {
  debug("goFrom:", goFrom)
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
  debug("goTo: ", goTo)
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
