import { beforeEach, expect, it } from "vitest"
import { Window } from "happy-dom"
import { HomePageMock } from "./__mocks__/HomePageMock"
import { Component } from "../src"
import { wait } from "./helpers/wait"

let window = new Window()
let document = window.document

beforeEach(() => {
  window = new Window()
  document = window.document
})

class Button extends Component {
  static attrName = "Button"
}
class NotExistInDOM extends Component {
  static attrName = "NotExistInDOM"
}

it("Should add properly", async () => {
  class HomePage extends Component {
    static attrName = "HomePage"
    public button = this.add(Button)
  }
  document.write(HomePageMock())
  const $root = document.querySelector(".HomePage") as any
  const homePage = new HomePage($root)
  expect(homePage.button).toBeInstanceOf(Button)
  expect(homePage.button.$root).toBe($root.querySelector(".Button"))
})

it("Should addAll properly", async () => {
  class HomePage extends Component {
    public buttons = this.addAll<Button[]>(Button)
    public notExistInDOM = this.addAll<NotExistInDOM[]>(NotExistInDOM)
  }

  document.write(HomePageMock())
  const $root = document.querySelector(".HomePage") as any
  const homePage = new HomePage($root, {}, "HomePage")
  expect(homePage.buttons.length).toBe(2)
  homePage.buttons.forEach((e) => expect(e).toBeInstanceOf(Button))
  expect(homePage.notExistInDOM).toEqual([])
})

it("Should addAll multiple instances properly", async () => {
  class HomePage extends Component {
    public buttons = this.addAll<Button[]>(Button)
  }
  document.write(HomePageMock())
  const $root = document.querySelector(".HomePage") as any
  $root.innerHTML = new Array(1000)
    .fill(`<div class="Button" data-component="Button">hello</div>`)
    .join("\n")
  
  const homePage = new HomePage($root, {}, "HomePage")
  expect(homePage.buttons.length).toBe(1000)
  homePage.buttons.forEach((e) => expect(e).toBeInstanceOf(Button))
})
