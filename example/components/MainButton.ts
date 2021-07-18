import { Component } from "../../src";

const componentName = "MainButton";
const debug = require("debug")(`front:${componentName}`);

/**
 * @name MainButton
 */
export default class MainButton extends Component {
  constructor($root, props) {
    super($root, props);
    this.init();
  }

  protected resizeHandler = () => {
    debug("window.innerWidth", window.innerWidth);
  };

  public mounted() {
    debug("start mount from MainButton");
    window.addEventListener("resize", this.resizeHandler);
  }

  public unmounted() {
    super.unmounted();
    debug("UN mount from MainButton");
    window.removeEventListener("resize", this.resizeHandler);
  }
}
