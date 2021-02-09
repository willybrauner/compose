import { Component } from "../../src";
import Header from "./Header";

const componentName = "App";
const debug = require("debug")(`front:${componentName}`);

export default class App extends Component {
  protected header: Header;

  public components() {
    return {
      Header: Header,
    };
  }

  public mount() {
    this.header = new Header("Header");
    debug("App is mounted", this.$element);
  }

  public unmount() {
    debug("App is unmounted", this.$element);
    this.header.unmount();
  }
}
