import { Component } from "../../../src"
import Header from "../components/Header"
import { defaultPlayIn, defaultPlayOut } from "../helpers/defaultTransitions"
import debug from "@wbe/debug"
const log = debug(`front:AboutPage`)

type TStaticProps = {}

type TAddComponents = {
  Header: InstanceType<typeof Header>
}

/**
 * @name AboutPage
 */
export default class AboutPage extends Component<TStaticProps, TAddComponents> {
  public static attrName = "AboutPage"

  protected Header = this.add(Header)

  public mounted() {
    log("> mounted")
    window.addEventListener("resize", this.resizeHandler)
  }

  public unmounted() {
    log("> unmounted")
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
