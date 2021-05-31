import { Component, TRegister } from "../../src";
import Header from "./Header";

const componentName = "App";
const debug = require("debug")(`composition:${componentName}`);

/**
 * @name App
 */
export default class App extends Component {
  protected children = {
    header: this.register<TRegister>("Header", Header),
  };

  constructor(e) {
    super(e);
    this.init();
    setTimeout(() => {
      this.children.header.$root.remove();
    }, 2400);
  }

  mount() {
    debug("start mount from App");
    window.addEventListener("resize", this.resizeHandler);
  }
  unmount() {
    super.unmount();
    debug("UN mount from App");
    window.removeEventListener("resize", this.resizeHandler);
  }

  onUpdate(mutation) {}


  protected resizeHandler = () => {
    debug("window.innerWidth", window.innerWidth);
  };

}
