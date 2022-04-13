import { IPage, Stack } from "../../../src"
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
export default class App extends Stack<TProps> {
  public static attrName = "App"

  
  public addPages() {
    return {
      HomePage,
      AboutPage,
      WorkPage,
    }
  }
  
  footer = this.add(Footer)
  
  public mounted() {
    log("this", this.footer);
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
  forcePageReloadIfDocumentIsFetching = true
}
