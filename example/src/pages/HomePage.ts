import { Component } from "../../../src";
import debugModule from "debug";
import Header from "../components/Header";
import { defaultPlayIn, defaultPlayOut } from "../helpers/defaultTransitions";
const debug = debugModule(`front:HomePage`);

/**
 * @name HomePage
 */
export default class HomePage extends Component {
  public static attrName = "HomePage";

  constructor($root, props) {
    super($root, props);
    this.init();
  }

  public components = {
    Header: this.add(Header),
  };

  public mounted() {
    window.addEventListener("resize", this.resizeHandler);
  }

  public unmounted() {
    window.removeEventListener("resize", this.resizeHandler);
  }

  protected resizeHandler = () => {
    debug("window.innerWidth", window.innerWidth);
  };

  // ------------------------------------------------------------------------------------- PAGE TRANSITION

  playIn($root?: HTMLElement, goFrom?: string): Promise<any> {
    return defaultPlayIn($root, goFrom);
  }
  playOut($root?: HTMLElement, goTo?: string): Promise<any> {
    return defaultPlayOut($root, goTo);
  }
}
