import { Component } from "../../../src";
import debugModule from "debug";
const debug = debugModule(`front:MainButton`);

/**
 * @name MainButton
 */
export default class MainButton extends Component {
  public static attrName = "MainButton";

  constructor($root, props) {
    super($root, props);
    this.init();
  }
}
