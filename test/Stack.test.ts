import { expect, it } from "vitest"
import { createBrowserHistory, createMemoryHistory } from "history"
import { Stack, Component } from "../src"
import { Window } from "happy-dom"
import { HomePageMock } from "./__mocks__/HomePageMock"
import { AboutPageMock } from "./__mocks__/AboutPageMock"
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

  protected beforeFetch($clickedLink: HTMLElement): Promise<void> {
    return super.beforeFetch($clickedLink)
  }

  // need to overwrite in order to fake fetch the data
  // Just assign url to DOM
  protected async fetchNewDocument(
    url: string,
    controller: AbortController
  ): Promise<Document> {
    return new Promise((resolve) => {
      if (this._fetching) this._fetching = false
      this._fetching = true
      const fakeDOM = {
        "/": HomePageMock,
        "/about": AboutPageMock,
      }
      const html = fakeDOM[url]()
      this._fetching = false
      const PARSER = new DOMParser()
      resolve(PARSER.parseFromString(html, "text/html"))
    })
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

it("Should fetch and inject new page in DOM when history change", async () => {
  document.write(HomePageMock())
  const $root = document.querySelector(".App") as any
  const history = createMemoryHistory()
  const app = new App({ $root, history })

  history.listen(({ location }) => {
    // console.log("listen", location.pathname)
  })

  // by default, we are on home page.
  await wait(100)
  expect(app.$root.querySelector(".HomePage")).toBeDefined()
  expect(app.$root.querySelector(".AboutPage")).toBeNull()
  // Simulate click on link
  history.push("/about")

  await wait(100)
  expect(app.$root.querySelector(".HomePage")).toBeNull()
  expect(app.$root.querySelector(".AboutPage")).toBeDefined()
  expect(app.$root.querySelector(".AboutPage").innerHTML).toEqual("About")
})

it("beforeFetch should be called when a link is clicked", async () => {
  document.write(HomePageMock())
  const $root = document.querySelector(".App") as any
  const history = createMemoryHistory()
  const app = new App({ $root, history })

  $root.querySelector(".Link_about").click()
  expect(app.$clickedLink.innerHTML).toEqual("about")

  $root.querySelector(".Link_home").click()
  expect(app.$clickedLink.innerHTML).toEqual("home")

})
