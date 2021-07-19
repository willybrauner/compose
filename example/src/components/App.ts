import { Stack } from "../../../src";
import debugModule from "debug";
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import { IDefaultPageTransitions, IPage, TManagePageTransitionParams } from "../../../src/Stack";
import { gsap } from "gsap";
const debug = debugModule(`front:App`);

/**
 * @name App
 */
export default class App extends Stack {
  public static attrName = "App";

  constructor($root, props) {
    super($root, props);
  }

  protected pages() {
    return {
      HomePage,
      AboutPage,
    };
  }

  protected async pageTransitions(
    currentPage: IPage,
    newPage: IPage,
    complete: () => void
  ): Promise<any> {
    await currentPage.playOut();
    await newPage.playIn();
    complete();
  }

  public defaultPlayOut($root: HTMLElement, goTo?: string): Promise<void> {
    debug("goTo", goTo);
    gsap.killTweensOf($root);
    return new Promise((resolve) => {
      gsap.fromTo(
        $root,
        {
          autoAlpha: 1,
          y: 0,
        },
        {
          autoAlpha: 0,
          y: 100,
          ease: "power3.inOut",
          onComplete: resolve,
        }
      );
    });
  }

  public defaultPlayIn($root: HTMLElement, goFrom?: string): Promise<void> {
    debug("goFrom: ", goFrom);
    gsap.killTweensOf($root);
    return new Promise((resolve) => {
      gsap.fromTo(
        $root,
        {
          y: 100,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          ease: "power3.inOut",
          onComplete: resolve,
        }
      );
    });
  }
}
