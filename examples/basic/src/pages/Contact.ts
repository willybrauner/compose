import { Component } from "@wbe/compose"
import Header from "../components/Header"
import debug from "@wbe/debug"
import { defaultTransitions } from "../helpers/defaultTransitions"
const log = debug(`front:Contact`)

type TStaticProps = {}

/**
 * @name Contact
 */
export default class Contact extends Component<TStaticProps> {
  public header = this.add(Header)

  public mounted() {
    window.addEventListener("resize", this.resizeHandler)
  }

  public unmounted() {
    window.removeEventListener("resize", this.resizeHandler)
  }

  protected resizeHandler = () => {
    log("window.innerWidth", window.innerWidth)
  }

  // ---------------------------------------------------------------------------  PAGE TRANSITION

  public transition = defaultTransitions(this.root)
  async playIn() {
    return this.transition.playIn()
  }
  async playOut() {
    return this.transition.playOut()
  }
}
