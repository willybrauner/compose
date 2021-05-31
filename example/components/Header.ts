import { Component, TRegister } from "../../src";
import MainButton from "./MainButton";

const componentName = "Header";
const debug = require("debug")(`composition:${componentName}`);

/**
 * @name Header
 */
export default class Header extends Component {
  protected children = {
    mainButton: this.register<TRegister[]>("Header_mainButton", MainButton),
  };

  constructor(e) {
    super(e);
    this.init();
  }

  protected resizeHandler = () => {
    debug("window.innerWidth", window.innerWidth);
  };

  public mount() {
    debug("start mount from header");
    window.addEventListener("resize", this.resizeHandler);
  }

  public unmount() {
    super.unmount();
    debug("UN mount from header");
    window.removeEventListener("resize", this.resizeHandler);
  }
}
