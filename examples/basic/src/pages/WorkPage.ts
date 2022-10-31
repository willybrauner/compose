import { Component } from "@wbe/compose"
import Header from "../components/Header"
import { defaultPlayIn, defaultPlayOut } from "../helpers/defaultTransitions"
import debug from "@wbe/debug"
const log = debug(`front:WorkPage`)

type TStaticProps = {}

/**
 * @name WorkPage
 */
export default class WorkPage extends Component<TStaticProps> {
  public static attrName = "WorkPage"
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

  public playOut(goTo: string, resolve: () => void) {
    defaultPlayOut(this.$root, goTo, resolve)
  }

  public playIn(comeFrom: string, resolve: () => void) {
    defaultPlayIn(this.$root, comeFrom, resolve)
  }
}
