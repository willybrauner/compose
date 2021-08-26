import { Component } from "../../../src"
import debugModule from "debug"
import Header from "../components/Header"
import { gsap } from "gsap"
import { defaultPlayIn, defaultPlayOut } from "../helpers/defaultTransitions"
const debug = debugModule(`front:HomePage`)

/**
 * @name HomePage
 */
export default class HomePage extends Component {
  public static attrName = "HomePage"

  constructor($root, props) {
    super($root, props)
    this.init()
  }

  public components = {
    Header: this.add(Header),
  }

  public mounted() {
    window.addEventListener("resize", this.resizeHandler)
  }

  public unmounted() {
    window.removeEventListener("resize", this.resizeHandler)
  }

  protected resizeHandler = () => {
    debug("window.innerWidth", window.innerWidth)
  }

  // ------------------------------------------------------------------------------------- PAGE TRANSITION

  public playOut(goTo: string, resolve: () => void) {
    defaultPlayOut(this.$root, goTo, resolve)
  }

  public playIn(comeFrom: string, resolve: () => void) {
    defaultPlayIn(this.$root, comeFrom, resolve)
  }
}
