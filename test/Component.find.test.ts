import { beforeEach, expect, it, Mock, vi } from "vitest"
import { Window } from "happy-dom"
import { HomePageMock } from "./__mocks__/HomePageMock"
import { wait } from "./helpers/wait"
import { Component } from "../src"

let window = new Window()
let document = window.document

beforeEach(() => {
  window = new Window()
  document = window.document
})

class HomePage extends Component {
  static attrName = "HomePage"
  public $section = this.find<HTMLElement>("section")
  public $notExist = this.find<HTMLElement>("notExist")
  public $sections = this.findAll<HTMLElement[]>("section")
  public $notExists = this.findAll<HTMLElement[]>("notExists")
}

it("Should find and findAll properly", async () => {
  document.write(HomePageMock())
  const $root = document.querySelector(".HomePage") as any
  const $section = $root.querySelector(".HomePage_section")
  const $sections = $root.querySelectorAll(".HomePage_section")
  const homePage = new HomePage($root)

  expect(homePage.$section).toEqual($section)
  expect(homePage.$notExist).toBeUndefined()

  expect(homePage.$sections).toEqual($sections)
  expect(homePage.$notExists).toEqual([])
})
