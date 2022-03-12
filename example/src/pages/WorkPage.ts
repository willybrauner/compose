import { Component } from "../../../src"
import Header from "../components/Header"
import { defaultPlayIn, defaultPlayOut } from "../helpers/defaultTransitions"
import debug from "@wbe/debug"
const log = debug(`front:WorkPage`)

type TStaticProps = {}

type TAddComponents = {
  Header: InstanceType<typeof Header>
}

/**
 * @name WorkPage
 */
export default class WorkPage extends Component<TStaticProps, TAddComponents> {
  public static attrName = "WorkPage"

  constructor($root, props) {
    super($root, props)
    this.init()
  }
  
  public addComponents() {
    return {
      Header: this.add(Header),
    }
  }

  public mounted() {
    log("use this.components", this.components)
    window.addEventListener("resize", this.resizeHandler)
  }

  public unmounted() {
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
