import { expect, it } from "vitest"
import { Window } from "happy-dom"
import { HomePageMock } from "./__mocks__/HomePageMock"
import { wait } from "./helpers/wait"
import { Component } from "../src"

let window = new Window()
let document = window.document

class HomePage extends Component {
  static attrName = "HomePage"
}

it("Extended class should be init properly.", async () => {
  document.write(HomePageMock())
  const $root = document.querySelector(".HomePage") as any
  const props = { foo: "bar" }
  const homePage = new HomePage($root, props)
  expect(HomePage.attrName).toBe("HomePage")
  expect(homePage.$root).toBe($root)
  expect(homePage.name).toBe("HomePage")
  expect(homePage.props).toBe(props)
  expect(parseInt($root.getAttribute("data-component-id"))).toBe(0)
  // wait next frame before next test because of mock
  await wait(0)
})
