import { Stack } from "../../../src";
import debugModule from "debug";
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import { gsap } from "gsap";
import { IPage, TManagePageTransitionParams } from "../../../src/Stack";

const debug = debugModule(`front:App`);

/**
 * @name App
 */
export default class App extends Stack {
  public static attrName = "App";

  constructor($root, props) {
    super($root, props);
    this.init();
  }

  protected pages(): { [p: string]: any } {
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
      newPage.$pageRoot.style.visibility = "hidden"
      currentPage.playOut(newPage.pageName);
      await newPage.playIn();
      resolve(newPage);
    });
  }
}
