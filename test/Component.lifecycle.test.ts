import { beforeEach, expect, it, Mock, vi } from "vitest"
import { Window } from "happy-dom"
import { HomePageMock } from "./__mocks__/HomePageMock"
import { wait } from "./helpers/wait"
import { Component } from "../src"

let window = new Window()
let document = window.document
let beforeMountMock = vi.fn()
let mountedMock = vi.fn()
let unmountedMock = vi.fn()

beforeEach(() => {
  window = new Window()
  document = window.document
  beforeMountMock.mockClear()
  mountedMock.mockClear()
  unmountedMock.mockClear()
})

class HomePage extends Component {
  static attrName = "HomePage"
  public beforeMount() {
    expect(this.$root).toBeUndefined()
    expect(this.isMounted).toBe(false)
    beforeMountMock()
  }

  public mounted() {
    expect(this.isMounted).toBe(true)
    mountedMock()
  }

  public unmounted() {
    unmountedMock()
  }
}

it("Life-cycle order should be respected.", async () => {
  document.write(HomePageMock())
  const homePage = new HomePage(document.querySelector(".HomePage") as any)
  expect(beforeMountMock).toBeCalledTimes(1)
  // wait a frame (see trick in Component constructor)
  await wait(0)
  expect(mountedMock).toBeCalledTimes(1)
  expect(unmountedMock).toBeCalledTimes(0)
  homePage.unmounted()
  expect(unmountedMock).toBeCalledTimes(1)
})

it("Should be automatically unmount if it is removed from DOM.", async () => {
  document.write(HomePageMock())
  const $root = document.querySelector(".HomePage") as any
  const homePage = new HomePage($root)
  await wait(0)
  $root.remove()
  // hard to test because of MutationObserver...
})


