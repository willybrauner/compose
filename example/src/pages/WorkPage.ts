import { Component } from "../../../src";
import debugModule from "debug";
import Header from "../components/Header";
import { defaultPlayIn, defaultPlayOut } from "../helpers/defaultTransitions";
const debug = debugModule(`front:WorkPage`);

/**
 * @name WorkPage
 */
export default class WorkPage extends Component {
  public static attrName = "WorkPage";

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

  // playIn($root?: HTMLElement, goFrom?: string): Promise<any> {
  //   return defaultPlayIn($root, goFrom);
  // }
  // playOut($root?: HTMLElement, goTo?: string): Promise<any> {
  //   return defaultPlayOut($root, goTo);
  // }
}
