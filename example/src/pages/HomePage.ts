import { Component } from "../../../src"
import Header from "../components/Header"
import { defaultPlayIn, defaultPlayOut } from "../helpers/defaultTransitions"
import debug from "@wbe/debug"
import MainButton from "../components/MainButton"
const log = debug(`front:HomePage`)

type TStaticProps = {}


/**
 * @name HomePage
 */
export default class HomePage extends Component<TStaticProps> {
  public static attrName = "HomePage"

  protected Header = this.add(Header)

  public mounted() {
    log('> mounted')

    window.addEventListener("resize", this.resizeHandler)
  }

  public unmounted() {
    log('> unmounted')
    window.removeEventListener("resize", this.resizeHandler)
  }

  protected resizeHandler = () => {
    log("window.innerWidth", window.innerWidth)
  }

  // ------------------------------------------------------------------------------------- PAGE TRANSITION

  public playOut(goTo: string, resolve: () => void) {
    defaultPlayOut(this.$root, goTo, resolve)
  }

  public playIn(comeFrom: string, resolve: () => void) {
    defaultPlayIn(this.$root, comeFrom, resolve)
  }
}
