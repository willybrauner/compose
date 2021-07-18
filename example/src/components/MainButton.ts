import { Component } from "../../../src";
import debugModule from "debug";
const debug = debugModule(`front:MainButton`);

/**
 * @name MainButton
 */
export default class MainButton extends Component {
  public static attrName = "MainButton";

  constructor($root, props) {
    super($root, props);
    this.init();
  }

  public mounted() {
    // super.mounted()
    // debug("start mount from MainButton");
    // window.addEventListener("resize", this.resizeHandler);
  }

  public unmounted() {
    //super.unmounted();
    // debug("UN mount from MainButton");
    // window.removeEventListener("resize", this.resizeHandler);
  }

  protected resizeHandler = () => {
    debug("window.innerWidth", window.innerWidth);
  };
}