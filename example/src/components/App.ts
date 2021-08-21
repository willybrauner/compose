import { IPage, Stack } from "../../../src";
import debugModule from "debug";
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import { gsap } from "gsap";
import WorkPage from "../pages/WorkPage";
import { IDefaultPageTransitions } from "../../../src";
const debug = debugModule(`front:App`);

/**
 * @name App
 */
export default class App extends Stack implements IDefaultPageTransitions {
  public static attrName = "App";

  constructor($root, props) {
    super($root, props);
  }
  protected pages() {
    return {
      HomePage,
      AboutPage,
      WorkPage,
    };
  }

  protected async pageTransitions(
    currentPage: IPage,
    newPage: IPage,
    complete: () => void
  ): Promise<any> {
    newPage.$pageRoot.style.visibility = "hidden";
     currentPage.playOut();
    await newPage.playIn();
    complete();
  }

  public defaultPlayOut({ $root, goTo, promiseRef }): Promise<void> {
    //debug("default goTo", goTo);
    gsap.killTweensOf($root);
    return new Promise((resolve, reject) => {
      promiseRef.reject = () => reject();

      gsap.fromTo(
        $root,
        {
          autoAlpha: 1,
          y: 0,
        },
        {
          autoAlpha: 0,
          y: 100,
          duration: 0.4,
          ease: "power3.inOut",
          onComplete: resolve,
        }
      );
    });
  }

  public defaultPlayIn({ $root, goFrom, promiseRef }): Promise<void> {
    // debug("default goFrom: ", goFrom);
    gsap.killTweensOf($root);
    return new Promise((resolve, reject) => {
      promiseRef.reject = () => reject();

      gsap.fromTo(
        $root,
        {
          y: 100,
          autoAlpha: 0,
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.4,
          ease: "power3.out",
          onComplete: resolve,
        }
      );
    });
  }
}
