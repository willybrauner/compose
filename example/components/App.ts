import { Component } from "../../src";
import Header from "./Header";
import MainButton from "./MainButton";

const componentName = "App";
const debug = require("debug")(`composition:${componentName}`);

export default class App extends Component {
  public components() {
    return {
      Header: Header,
      MainButton: MainButton,
    };
  }

  public mount() {
    //super.mount();
    debug("App is mounted", this.$element);
  }

  public unmount() {
    //super.unmount();
    debug("App is unmounted", this.$element);
  }
}
