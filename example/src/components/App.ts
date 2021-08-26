import { IPage, Stack } from "../../../src"
import debugModule from "debug"
import HomePage from "../pages/HomePage"
import AboutPage from "../pages/AboutPage"
import WorkPage from "../pages/WorkPage"
const debug = debugModule(`front:App`)

/**
 * @name App
 */
export default class App extends Stack {
  public static attrName = "App"

  constructor($root, props) {
    super($root, props)
  }
  protected pages() {
    return {
      HomePage,
      AboutPage,
      WorkPage,
    }
  }

  protected async pageTransitions(
    currentPage: IPage,
    newPage: IPage,
    complete: () => void
  ): Promise<any> {
//    newPage.$pageRoot.style.visibility = "hidden"
    currentPage.playOut()
    await newPage.playIn()
    complete()
  }
}
