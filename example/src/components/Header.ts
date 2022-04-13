import { Component } from "../../../src"
import MainButton from "./MainButton"
import debug from "@wbe/debug"
const log = debug(`front:Header`)

type TStaticProps = {}

type TAddComponents = {
  MainButton: InstanceType<typeof MainButton>[]
}

/**
 * @name Header
 */
export default class Header extends Component<TStaticProps, TAddComponents> {
  public static attrName = "Header"

  protected MainButton = this.add<MainButton[]>(MainButton)

  public mounted() {
    log("mounted")
    window.addEventListener("resize", this.resizeHandler)
  }

  public unmounted() {
    window.removeEventListener("resize", this.resizeHandler)
  }

  protected resizeHandler = () => {
    log("window.innerWidth", window.innerWidth)
  }
}
