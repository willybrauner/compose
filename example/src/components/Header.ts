import { Component } from "../../../src";

import MainButton from "./MainButton"
import debug from "@wbe/debug"
const log = debug(`front:Header`)

/**
 * @name Header
 */
export default class Header extends Component {
  public static attrName = "Header";

  constructor($root, props) {
    super($root, props);
    this.init();
  }

  public components = {
    MainButton: this.add(MainButton)
  }

  public mounted() {
    window.addEventListener("resize", this.resizeHandler);
  }

  public unmounted() {
    window.removeEventListener("resize", this.resizeHandler);
  }

  protected resizeHandler = () => {
    log("window.innerWidth", window.innerWidth);
  };
}
