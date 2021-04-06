import { Component } from "../../src";
import Header from "./Header";
import { compo } from "../../src/Component";

const componentName = "App";
const debug = require("debug")(`composition:${componentName}`);

export default class App extends Component {
  protected header = compo("Header", Header);

  public mount() {
    debug("App is mounted", this.$root);
    this.header.instance.mount();
  }

  public unmount() {
    debug("App is unmounted");
    this.header.instance.unmount();
  }

  watch(): void {}
}
