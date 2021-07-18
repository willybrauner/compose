import { Component } from "../../src";
import MainButton from "./MainButton";

const componentName = "Header";
const debug = require("debug")(`front:${componentName}`);

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
    MainButton: this.add(MainButton),
  };

  public mounted() {
    super.mounted();
    debug("start mount from header", this.components.MainButton);
    window.addEventListener("resize", this.resizeHandler);
  }

  public unmounted() {
    super.unmounted();
    debug("UN mount from header");
    window.removeEventListener("resize", this.resizeHandler);
  }

  protected resizeHandler = () => {
    debug("window.innerWidth", window.innerWidth);
  };
}
