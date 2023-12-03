// @vitest-environment happy-dom
import { beforeEach, expect, it } from "vitest"
import { Window } from "happy-dom"
import { HomePageMock } from "./templates/HomePageMock"
import { Component } from "../src"

let window = new Window()
let document = window.document

beforeEach(() => {
  window = new Window()
  document = window.document
})

class HomePage extends Component {
  public section = this.find<HTMLElement>("_section")
  public notExist = this.find<HTMLElement>("_notExist")
  public notExists = this.findAll<HTMLElement[]>("_notExists")
}

it("Should find and findAll properly", async () => {
  document.write(HomePageMock())
  const root = document.querySelector(".HomePage") as any
  const section = root.querySelector(".HomePage_section")
  const homePage = new HomePage(root)

  expect(homePage.section).toEqual(section)
  expect(homePage.notExist).toBeNull()
  expect(homePage.notExists).toEqual([])
})
