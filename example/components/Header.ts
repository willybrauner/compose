import { Component } from "../../src";

const componentName = "Header";
const debug = require("debug")(`front:${componentName}`);

export default class Header extends Component {
  constructor(e) {
    super(e);
  }


  public mount() {
    debug("MOUNT !!!!", this);
    this.resizeHandler();
    window.addEventListener("resize", this.resizeHandler);
  }

  public unmount() {
    debug("unmounted", this);
    window.removeEventListener("resize", this.resizeHandler);
  }

  public resizeHandler() {
    debug("window.innerWidth", window.innerWidth);
  }
}
