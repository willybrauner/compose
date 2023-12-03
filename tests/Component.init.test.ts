// @vitest-environment happy-dom
import { expect, it } from "vitest"
import { Window } from "happy-dom"
import { HomePageMock } from "./templates/HomePageMock"
import { Component } from "../src"

let window = new Window()
let document = window.document

class HomePage extends Component {}

it("Extended class should be init properly.", async () => {
  document.write(HomePageMock())
  const root = document.querySelector(".HomePage") as any
  const props = { foo: "bar" }
  const homePage = new HomePage(root, { props })

  expect(HomePage.name).toBe("HomePage")
  expect(homePage.root).toBe(root)
  expect(homePage.props).toBe(props)
  expect(parseInt(root.getAttribute("data-id"))).toBeTypeOf("number")
})
