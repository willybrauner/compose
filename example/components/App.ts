import { Component } from "../../src";
import Header from "./Header";

const componentName = "App";
const debug = require("debug")(`front:${componentName}`);

/**
 * @name App
 */
export default class App extends Component {
  public static attrName = "App";

  constructor($root, props) {
    super($root, props);
    this.init();
  }

  public components = {
    Header: this.add(Header),
  };

  public mounted() {
    debug("COUCOU start mount from App");
    window.addEventListener("resize", this.resizeHandler);

    // setTimeout(() => {
    //   this.components.Header.$root.remove();
    // }, 2000);
  }
  public unmounted() {
    debug("UN mount from App");
    window.removeEventListener("resize", this.resizeHandler);
  }

  protected resizeHandler = () => {
    debug("window.innerWidth", window.innerWidth);
  };
}
