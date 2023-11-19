import { Component } from "@wbe/compose"
import Header from "../components/Header"
import debug from "@wbe/debug"
import { defaultTransitions } from "../helpers/defaultTransitions"
const log = debug(`front:About`)

/**
 * @name About
 */
export default class About extends Component {
  protected header = this.add(Header)

  mounted() {
    log("> mounted")
    window.addEventListener("resize", this.resizeHandler)
  }

  unmounted() {
    log("> unmounted")
    window.removeEventListener("resize", this.resizeHandler)
  }

  protected resizeHandler = () => {
    log("window.innerWidth", window.innerWidth)
  }

  // --------------------------------------------------------------------------- PAGE TRANSITION

  public transition = defaultTransitions(this.root)
  async playIn() {
    return this.transition.playIn()
  }
  async playOut() {
    return this.transition.playOut()
  }
}
