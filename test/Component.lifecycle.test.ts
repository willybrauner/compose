import { beforeEach, expect, it, Mock, vi } from "vitest"
import { Window } from "happy-dom"
import { HomePageMock } from "./__mocks__/HomePageMock"
import { wait } from "./helpers/wait"
import { Component } from "../src"

let window
let document

beforeEach(() => {
  window = new Window()
  document = window.document
})

it("Life-cycle order should be respected.", async () => {
  let beforeMountMock = vi.fn()
  let mountedMock = vi.fn()
  let unmountedMock = vi.fn()

  class HomePage extends Component {
    static attrName = "HomePage"
    public beforeMount() {
      expect(this.$root).toBeUndefined()
      beforeMountMock()
    }
    public mounted() {
      mountedMock()
    }
    public unmounted() {
      unmountedMock()
    }
  }

  document.write(HomePageMock())
  const homePage = new HomePage(document.querySelector(".HomePage") as any)
  expect(beforeMountMock).toBeCalledTimes(1)
  // waiting for a frame (see trick in Component constructor)
  await wait(0)
  expect(mountedMock).toBeCalledTimes(1)
  expect(unmountedMock).toBeCalledTimes(0)
  homePage.unmounted()
  expect(unmountedMock).toBeCalledTimes(1)
})

it("Should mount & unmount children components", async () => {
  let homeMountedMock = vi.fn()
  let homeUnmountedMock = vi.fn()
  let buttonMountedMock = vi.fn()
  let buttonUnmountedMock = vi.fn()
  let labelMountedMock = vi.fn()
  let labelUnmountedMock = vi.fn()
  let mountedOrder = []
  let unmountedOrder = []
  /**
   * Home
   *   Button
   *      Label
   */
  class HomePage extends Component {
    static attrName = "HomePage"
    public button = this.add(Button)
    public mounted() {
      homeMountedMock()
      mountedOrder.push(this.name)
    }
    public unmounted() {
      homeUnmountedMock()
      unmountedOrder.push(this.name)
    }
    public _unmounted() {
      super._unmounted()
    }
  }
  class Button extends Component {
    static attrName = "Button"
    public label = this.add(Label)
    public mounted() {
      buttonMountedMock()
      mountedOrder.push(this.name)
    }
    public unmounted() {
      buttonUnmountedMock()
      unmountedOrder.push(this.name)
    }
  }
  class Label extends Component {
    static attrName = "Label"
    public mounted() {
      labelMountedMock()
      mountedOrder.push(this.name)
    }
    public unmounted() {
      labelUnmountedMock()
      unmountedOrder.push(this.name)
    }
  }

  document.write(HomePageMock())
  const $root = document.querySelector(".HomePage") as any

  // add appropriate DOM
  $root.innerHTML = `
     <div class="Button" data-component="Button">
           <div class="Label" data-component="Label">label</div>
    </div>`

  // root instance will chain children instances
  const homePage = new HomePage($root)

  expect(homePage.$root.getAttribute("data-component-id")).toBeDefined()
  expect(homePage.button.$root.getAttribute("data-component-id")).toBeDefined()
  expect(homePage.button.label.$root.getAttribute("data-component-id")).toBeDefined()

  // waiting for a frame (see trick in Component constructor)
  await wait(0)
  ;[homeMountedMock, buttonMountedMock, labelMountedMock].forEach((e) =>
    expect(e).toHaveBeenCalledTimes(1)
  )
  expect(mountedOrder).toEqual(["HomePage", "Button", "Label"])

  // unmounted() will not unmount children component, only current instance
  homePage.unmounted()
  expect(homeUnmountedMock).toHaveBeenCalledTimes(1)
  expect(buttonUnmountedMock).toHaveBeenCalledTimes(0)
  expect(labelUnmountedMock).toHaveBeenCalledTimes(0)

  // clear
  homeUnmountedMock.mockClear()
  buttonUnmountedMock.mockClear()
  labelUnmountedMock.mockClear()
  unmountedOrder = []

  // _unmounted() will unmount all children component
  // (protected method, making public here)
  homePage._unmounted()
  ;[homeUnmountedMock, buttonUnmountedMock, labelUnmountedMock].forEach((e) =>
    expect(e).toHaveBeenCalledTimes(1)
  )
  expect(unmountedOrder).toEqual(["HomePage", "Button", "Label"])
})
