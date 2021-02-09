import { Component } from "../../src";

const componentName = "Header";
const debug = require("debug")(`composition:${componentName}`);

export default class Header extends Component {

  public mount() {
    debug("MOUNT !!!!", this);
    this.resizeHandler();
    window.addEventListener("resize", this.resizeHandler, false);
  }

  public unmount() {
    debug("unmounted", this);
    window.removeEventListener("resize", this.resizeHandler);
  }

  public resizeHandler() {
    debug("window.innerWidth", window.innerWidth);
  }
}
