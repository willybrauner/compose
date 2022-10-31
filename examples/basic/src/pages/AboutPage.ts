import { Component } from "@wbe/compose"
import Header from "../components/Header"
import { defaultPlayIn, defaultPlayOut } from "../helpers/defaultTransitions"
import debug from "@wbe/debug"
const log = debug(`front:AboutPage`)

type TStaticProps = {}

/**
 * @name AboutPage
 */
export default class AboutPage extends Component<TStaticProps> {
  public static attrName = "AboutPage"

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

  public playOut(goTo: string, resolve: () => void) {
    defaultPlayOut(this.$root, goTo, resolve)
  }

  public playIn(comeFrom: string, resolve: () => void) {
    defaultPlayIn(this.$root, comeFrom, resolve)
  }
}
