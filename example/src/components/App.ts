import { IPage, Stack } from "../../../src"
import HomePage from "../pages/HomePage"
import AboutPage from "../pages/AboutPage"
import WorkPage from "../pages/WorkPage"
import debug from "@wbe/debug"
const log = debug(`front:App`)

/**
 * @name App
 */
export default class App extends Stack {
  public static attrName = "App"

  // disableLinksDuringTransitions = true
  // disableHistoryDuringTransitions = true
  forcePageReloadIfDocumentIsFetching = true

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
    newPage.$pageRoot.style.visibility = "hidden"
    currentPage.playOut()
    await newPage.playIn()
    complete()
  }
}
