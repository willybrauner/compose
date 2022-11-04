import { expect, it } from "vitest"
import {createBrowserHistory, createMemoryHistory} from "history"
import { Stack, Component } from "../src"
import { Window } from "happy-dom"
import { HomePageMock } from "./__mocks__/HomePageMock"
import { wait } from "./helpers/wait"

const window = new Window()
const document = window.document

class HomePage extends Component {
  static attrName = "HomePage"
}
class AboutPage extends Component {
  static attrName = "AboutPage"
}

export class App extends Stack {
  static attrName = "App"

  // Overwrite in order to get container on document.body
  protected getPageContainer(body: any = document.body): HTMLElement {
    return super.getPageContainer(body)
  }

  addPages() {
    return { HomePage, AboutPage }
  }

  async pageTransitions(currentPage, newPage, complete): Promise<any> {
    await currentPage.playOut()
    await newPage.playIn()
    complete()
  }
}

it("App should be instance of Stack & Component", () => {
  document.write(HomePageMock())
  const $root = document.querySelector(".App") as any
  const history = createBrowserHistory()
  const app = new App({ $root, history })

  expect(app).toBeInstanceOf(Stack)
  expect(app).toBeInstanceOf(Component)
  expect(app.pages).toEqual({ HomePage, AboutPage })
})

it("Should fetch new page we link is clicked", async () => {
  document.write(HomePageMock())
  const $root = document.querySelector(".App") as any
  const history = createMemoryHistory()
  const app = new App({ $root, history })

  history.listen(({location}) => {
    console.log(location.pathname)
  })
  //const link = $root.querySelectorAll(`.Link_about`)
  //  console.log("link", link)
  history.push("/about")
})
