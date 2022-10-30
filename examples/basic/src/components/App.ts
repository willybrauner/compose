import {IPage, Stack} from "@wbe/compose"
import HomePage from "../pages/HomePage"
import AboutPage from "../pages/AboutPage"
import WorkPage from "../pages/WorkPage"
import debug from "@wbe/debug"
import Footer from "./Footer"
const log = debug(`front:App`)

type TProps = {
  foo: string
}

/**
 * @name App
 */
export class App extends Stack {
  public static attrName = "App"
  public footer = this.add<Footer>(Footer)

  public addPages() {
    return {
      HomePage,
      AboutPage,
      WorkPage,
    }
  }

  public mounted() {
    log("this.footer", this.footer)
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

  // disableLinksDuringTransitions = true
  // disableHistoryDuringTransitions = true
  // forcePageReloadIfDocumentIsFetching = true
}
