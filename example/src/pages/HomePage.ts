import { Component } from "../../../src";
import debugModule from "debug";
import Header from "../components/Header";
import { defaultPlayIn, defaultPlayOut } from "../helpers/defaultTransitions";
const debug = debugModule(`front:HomePage`);

/**
 * @name HomePage
 */
export default class HomePage extends Component {
  public static attrName = "HomePage";

  constructor($root, props) {
    super($root, props);
    this.init();
  }

  public components = {
    Header: this.add(Header),
  };

  public mounted() {
    window.addEventListener("resize", this.resizeHandler);
  }

  public unmounted() {
    window.removeEventListener("resize", this.resizeHandler);
  }

  protected resizeHandler = () => {
    debug("window.innerWidth", window.innerWidth);
  };

  // ------------------------------------------------------------------------------------- PAGE TRANSITION

  public playIn() {
    return defaultPlayIn(this.$root);
  }
  public playOut() {
    return defaultPlayOut(this.$root);
  }
}
