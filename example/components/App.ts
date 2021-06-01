import { Component } from "../../src";
import Header from "./Header";

const componentName = "App";
const debug = require("debug")(`composition:${componentName}`);

/**
 * @name App
 */
export default class App extends Component {
  public children = {
    header: this.register<Header>(Header, "Header"),
  };

  constructor(e) {
    super(e);
    this.init();

    const title = this.find<HTMLElement>("title");
    debug("title", title);
    // test
    setTimeout(() => {
      this.children.header.$root.remove();
    }, 2400);
  }

  mounted() {
    debug("start mount from App");
    window.addEventListener("resize", this.resizeHandler);
  }
  unmounted() {
    super.unmounted();
    debug("UN mount from App");
    window.removeEventListener("resize", this.resizeHandler);
  }

  updated(mutation) {}

  protected resizeHandler = () => {
    debug("window.innerWidth", window.innerWidth);
  };
}
