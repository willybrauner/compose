import { Component } from "../../../src"
import Header from "../components/Header"
import { defaultPlayIn, defaultPlayOut } from "../helpers/defaultTransitions"
import debug from "@wbe/debug"
import MainButton from "../components/MainButton"
const log = debug(`front:HomePage`)

type TStaticProps = {}

type TAddComponents = {
  Header: InstanceType<typeof Header>
  MainButton: InstanceType<typeof MainButton>[]
}

/**
 * @name HomePage
 */
export default class HomePage extends Component<TStaticProps, TAddComponents> {
  public static attrName = "HomePage"

  constructor($root, props) {
    super($root, props)
    this.init()
  }

  addComponents() {
    return {
      Header: this.add(Header),
      MainButton: this.add<MainButton[]>(MainButton),
    }
  }

  public mounted() {
    log("this.components", this.components)
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
