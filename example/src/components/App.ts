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
export default class App extends Stack implements IDefaultPageTransitions {
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

  /**
   * Page transitions
   * Default transition to override from parent component
   * @param currentPage
   * @param mountNewPage
   * @protected
   */
  protected pageTransitions({
    currentPage,
    mountNewPage,
  }: TManagePageTransitionParams): Promise<IPage> {
    return new Promise(async (resolve) => {
      const newPage = await mountNewPage();
      // newPage.$pageRoot.style.visibility = "hidden";
      currentPage.playOut(newPage.pageName);
      await newPage.playIn();
      resolve(newPage);
    });
  }

  public defaultPlayOut($root: HTMLElement, goTo?: string): Promise<any> | undefined {
    debug("goTo", goTo);
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

  public defaultPlayIn($root: HTMLElement, goFrom?: string): Promise<any> | undefined {
    debug("goFrom: ", goFrom);
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
