import { Component } from "../../src";
import MainButton from "./MainButton";

const componentName = "Header";
const debug = require("debug")(`composition:${componentName}`);

/**
 * @name Header
 */
export default class Header extends Component {
  public children = {
    mainButton: this.register<MainButton[]>(MainButton, "Header_mainButton"),
  };

  constructor(e) {
    super(e);
    this.init();
    debug(this.children.mainButton);
  }

  protected resizeHandler = () => {
    debug("window.innerWidth", window.innerWidth);
  };

  public mounted() {
    debug("start mount from header");
    window.addEventListener("resize", this.resizeHandler);
  }

  public unmounted() {
    super.unmounted();
    debug("UN mount from header");
    window.removeEventListener("resize", this.resizeHandler);
  }
}
