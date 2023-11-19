import { Component } from "@wbe/compose"
import Header from "../components/Header"
import debug from "@wbe/debug"
import { defaultTransitions } from "../helpers/defaultTransitions"
import { listen } from "@cher-ami/utils"
const log = debug(`front:Home`)

type TStaticProps = {}

/**
 * @name Home
 */
export default class Home extends Component<TStaticProps> {
  public header = this.add(Header)

  public mounted() {
    return listen(window, "resize", () => {
      log("window.innerWidth", window.innerWidth)
    })
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
