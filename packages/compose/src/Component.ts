import debug from "@wbe/debug"
const log = debug(`compose:Component`)

type Props = Record<string, any>
interface ComponentOptions<P> {
  name: string
  props: P
}

// global
export const ID_ATTR = "data-id"
let ID = 0

/**
 * Component
 */
export class Component<P = Props> {
  public readonly root: HTMLElement
  public readonly id: number
  public readonly name: string
  public readonly props: P

  #observer: MutationObserver
  #isMounted: boolean = false
  public get isMounted() {
    return this.#isMounted
  }

  constructor(root: HTMLElement, options: Partial<ComponentOptions<P>> = {}) {
    this.beforeMount()
    this.root = root
    this.name = options.name ?? this.root?.classList?.[0]
    this.props = options.props
    this.id = ID++
    this.root.setAttribute(ID_ATTR, `${this.id}`)

    // hack: exe init method with timeout to access `this` inside
    // the component witch extends Component
    setTimeout(() => {
      this.#mounted()
      this.#watchChildren()
    }, 0)
  }

  public beforeMount(): void {}

  public mounted(): void {}
  #mounted(): void {
    log(`🟢 ${this.name} mounted`)
    this.mounted()
    this.#isMounted = true
  }

  public unmounted(): void {}

  protected _unmounted(): void {
    log(`🔴 ${this.name} unmounted`)
    this.unmounted()
    this.#isMounted = false
    this.#onChildrenComponents((component: Component) => {
      if (component) component._unmounted()
    })
  }

  // --------------------------------------------------------------------------- ADD

  /**
   * Add is a register child component function
   * It create new children instance
   */
  public add<C extends Component, P = Props>(
    classComponent: new <P = Props>(...args: any[]) => C,
    options?: Partial<ComponentOptions<P>>,
  ): C {
    const name = options?.name || classComponent?.["name"]
    const element = this.root.querySelector(`.${name}`)
    return element ? new classComponent<P>(element, options) : null
  }

  /**
   * Add multiple children components
   */
  public addAll<C extends Component[], P = Props>(
    classComponent: new <P = Props>(...args: any[]) => C extends (infer U)[] ? U : never,
    options?: Partial<ComponentOptions<P>>,
  ): C {
    const arr = []
    const name = options?.name || classComponent?.["name"]
    const elements = this.root.querySelectorAll(`.${name}`)
    if (!elements?.length) return arr as any

    // map on each elements (because elements return an array)
    for (let i = 0; i < elements.length; i++) {
      const classInstance = new classComponent<P>(elements[i], options)
      arr.push(classInstance)
    }
    return arr as C
  }

  // --------------------------------------------------------------------------- FIND

  /**
   * Find single HTML element from parent root
   */
  public find<T extends HTMLElement>(className: string): T {
    return this.root?.querySelector<T>(
      className.startsWith("_") ? `.${this.name}${className}` : `.${className}`,
    )
  }

  /**
   * Find HTML element list from parent root
   */
  public findAll<T extends HTMLElement[]>(className: string): T {
    const els = this.root?.querySelectorAll(
      className.startsWith("_") ? `.${this.name}${className}` : `.${className}`,
    )
    return Array.from(els || []) as T
  }

  // --------------------------------------------------------------------------- TRANSITIONS

  public playIn(): Promise<any | void> {
    return Promise.resolve()
  }

  public playOut(): Promise<any | void> {
    return Promise.resolve()
  }

  // --------------------------------------------------------------------------- CORE

  /**
   * Process callback function on each children components
   * A children component is an instance of Component
   * @param callback
   */
  #onChildrenComponents(callback: (component) => void): void {
    Object.keys(this)?.forEach((child) => {
      const curr = this?.[child]
      if (Array.isArray(curr)) {
        curr.forEach((c) => {
          if (c instanceof Component) callback(c)
        })
      } else if (curr instanceof Component) callback(curr)
    })
  }

  /**
   *  Watch children components changed
   *  If this current component is removed (with his children), unmount children
   */
  #watchChildren(): void {
    this.#observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        for (const node of mutation.removedNodes as any) {
          const nodeRemovedId = this.#getComponentId(node as any)
          const parentNode = node.parentNode?.querySelector(`*[${ID_ATTR}='${nodeRemovedId}']`)
          if (nodeRemovedId && parentNode) continue

          this.#onChildrenComponents((component) => {
            if (!component) return
            if (nodeRemovedId === component?.id && component?.isMounted) {
              component._unmounted()
              component.observer.disconnect()
            }
          })
        }
      }
    })

    if (this.root) {
      this.#observer.observe(this.root, {
        subtree: true,
        childList: true,
      })
    }
  }

  /**
   * Get component ID
   * @param $node
   */
  #getComponentId($node: HTMLElement): number {
    return $node?.getAttribute?.(ID_ATTR) && parseInt($node.getAttribute(ID_ATTR))
  }
}
