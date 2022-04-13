import { COMPONENT_ATTR } from "./../src/Component"
import { Component } from "./../src/Component"
const { log } = console

const wait = async (d = 0) => new Promise((r) => setTimeout(r, d))


describe("component", () => {
  // ------------------------------------------------------------------------------------- PREPARE

  document.body.innerHTML = `
  <body>
    <div class="App" data-component="App" data-testid="App">
        <button data-component="Button">Button</button>
    </div>
  </body>
  `
  const $app = document.body.querySelector(".App") as HTMLElement

  const beforMountedMock = jest.fn()
  const mountedMock = jest.fn()
  const unmountedMock = jest.fn()

  class App extends Component {
    button = this.add(Button)

    beforeMount() {
      beforMountedMock()
    }
    mounted() {
      mountedMock()
    }
    unmounted() {
      unmountedMock()
    }
  }

  const buttonMountedMock = jest.fn()
  const buttonUnmountedMock = jest.fn()

  class Button extends Component {
    static attrName = "Button"
    mounted() {
        buttonMountedMock()
    }
    unmounted() {
        buttonUnmountedMock()
    }
  }

  let app: App
  beforeEach(() => {
    jest.clearAllMocks()
    app = new App($app)
  })
  afterEach(() => {
    jest.clearAllMocks()
  })

  // ------------------------------------------------------------------------------------- TEST

  /**
   * instance & lifecycle
   */

  it("should register root element", () => {
    expect(app.$root.classList).toContain("App")
  })
  it("should return the right name", () => {
    expect(app.name).toBe("App")
  })
  it("should add data-component-id", () => {
    expect(app.$root.hasAttribute(COMPONENT_ATTR)).toBe(true)
  })
  it("should execute lifecicle methods", async () => {
    expect(beforMountedMock.mock.calls.length).toBe(1)
    await wait()
    expect(mountedMock).toBeCalled()
  })
  it("child component is instantiated", async () => {
    await wait()
    expect(buttonMountedMock).toBeCalled()
  })
  it("child component is unmounted when DOM element is remove", async () => {
    await wait()
    app.button.$root.remove()
    await wait()
    expect(buttonUnmountedMock).toBeCalled()
  })
})

/**
 * add()
 */



/**
 * find()
 */