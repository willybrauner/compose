import debug from "@wbe/debug"
const log = debug(`compose:Component`)

export type TProps = { [x: string]: any } | void
type GetElementType<T extends any[]> = T extends (infer U)[] ? U : never

/**
 * Glob scope
 */
let COMPONENT_ID = 0
export const COMPONENT_ATTR = "data-component"
export const ID_ATTR = "data-component-id"

/**
 * Component class
 */
export class Component<Props = TProps> {
  /**
   * Component name
   */
  public name: string

  /**
   * Root DOM element
   */
  public $root: HTMLElement

  /**
   * Static props from the parent component
   */
  public props: Props

  /**
   * Random ID of current instance
   * Counter is incremented on each instance and add as attribute on DOM element
   */
  public id: number

  /**
   * Flag to know if current instance is mounted
   */
  private _isMounted: boolean = false
  public get isMounted() {
    return this._isMounted
  }

  /**
   * Mutation observer allows to know if current DOM element change
   */
  private observer: MutationObserver

  /**
   * @param $root Dom element link with the instance
   * @param props Object properties of the instance
   * @param attrName is value from data-component="{name}"
   */
  constructor($root?: HTMLElement, props?: Props, attrName?: string) {
    // Before mount method executed on construct root, before all process
    this._beforeMount()

    // keep params in local
    this.props = props
    this.$root = $root
    this.name = attrName || Component.getComponentName(this.$root)

    // set ID on DOM element
    this.$root.setAttribute(ID_ATTR, `${COMPONENT_ID}`)
    this.id = COMPONENT_ID
    COMPONENT_ID++

    // hack: exe init method with timeout to access `this` inside component methods
    window.setTimeout(() => this.init(), 0)
  }

  /**
   * Init
   */
  protected init() {
    this._mounted()
    this._watchChildren()
  }

  /**
   * Before mount
   */
  public beforeMount(): void {}
  protected _beforeMount(): void {
    this.beforeMount()
  }

  /**
   * When component is mounted
   */
  public mounted(): void {}
  protected _mounted(): void {
    log("🟢 mounted", this.name)
    this.mounted()
    this._isMounted = true
  }

  /**
   * When component is unmounted
   * Will execute unmounted() method of children components
   */
  public unmounted() {}
  protected _unmounted(): void {
    this.unmounted()
    this._isMounted = false
    this.onChildrenComponents((component: Component) => {
      COMPONENT_ID--
      component?._unmounted()
    })
    log("🔴 unmounted", this.name)
  }

  /**
   * Add is a register child component function
   * It create new children instance
   */
  public add<C extends Component, P = TProps>(
    classComponent: new <P = TProps>(...args: any[]) => C,
    props?: P,
    attrName?: string
  ): C {
    // get string name instance from param or static attrName property
    const name: string = attrName || classComponent?.["attrName"]
    // get first DOM element
    const element = Component.getDomElement(this.$root, name)?.[0]
    // if no elements, exit
    if (!element) return
    // create and return child instance
    return new classComponent<P>(
      element,
      {
        ...props,
        key: 0,
        parentId: this.id,
      },
      name
    )
  }

  /**
   * Add multiple children components
   */
  public addAll<C extends Component[], P = TProps>(
    classComponent: new <P = TProps>(...args: any[]) => GetElementType<C>,
    props?: P,
    attrName?: string
  ): C[] {
    // prepare instances array
    const localInstances = []
    // get string name instance from param or static attrName property
    const name: string = attrName || classComponent?.["attrName"]
    // get DOM elements
    const elements = Component.getDomElement(this.$root, name)
    // if no elements, exit
    if (!elements.length) return localInstances
    // map on each elements (because elements return an array)
    for (let i = 0; i < elements.length; i++) {
      // create child instance
      const classInstance = new classComponent<P>(
        elements[i],
        {
          ...props,
          key: i,
          parentId: this.id,
        },
        name
      )
      localInstances.push(classInstance)
    }
    // return all instances
    return localInstances
  }

  /**
   * Find HTML element with BEM element name
   * ex:
   *  if class name is "Block_section"
   *  this.find("section") will return DOM element with "Block_section" class
   */
  public find<T extends HTMLElement>(
    bemElementName: string,
    className = this.$root?.classList?.[0]
  ): T {
    if (!className || !bemElementName || !this.$root) return
    const element = this.$root.querySelector<T>(`.${className}_${bemElementName}`)
    if (!element) return
    else return element
  }

  /**
   * Find HTML element list with BEM element name
   * ex:
   *  if class name is "Block_section"
   *  this.find("section") will return DOM element with "Block_section" class
   *
   * @param bemElementName
   * @param className
   */
  public findAll<T extends HTMLElement[]>(
    bemElementName: string,
    className = this.$root?.classList?.[0]
  ): T {
    if (!className || !bemElementName || !this.$root) return
    const elements = this.$root.querySelectorAll(`.${className}_${bemElementName}`)
    return Array.from(elements || []) as T
  }

  // ------------------------------------------------------------------------------------- TRANSITIONS

  /**
   * PlayIn Ref used by stack
   * Stack need to access promiseRef object
   * @param comeFrom
   * @param promiseRef
   */
  public _playInRef(
    comeFrom?: string,
    promiseRef?: { reject: () => void }
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      promiseRef.reject = () => reject()
      this.playIn(comeFrom, resolve)
    })
  }

  /**
   * Component playIn
   * @param comeFrom
   * @param resolve
   */
  public playIn(comeFrom: string, resolve: () => void): void {
    resolve()
  }

  /**
   * PlayOut Ref used by Stack
   * Stack need to access promiseRef object
   * @param goTo
   * @param promiseRef
   */
  public _playOutRef(goTo?: string, promiseRef?: { reject: () => void }): Promise<void> {
    return new Promise((resolve, reject) => {
      promiseRef.reject = () => {
        reject()
        this._unmounted()
      }
      this.playOut(goTo, resolve)
    })
  }

  /**
   * Component playOut
   * @param goTo
   * @param resolve
   */
  public playOut(goTo: string, resolve: () => void): void {
    resolve()
  }

  // ------------------------------------------------------------------------------------- CORE

  /**
   * Get DOM element
   */
  private static getDomElement($root: HTMLElement, name: string): HTMLElement[] {
    return Array.from($root?.querySelectorAll(`*[${COMPONENT_ATTR}=${name}]`) || [])
  }

  /**
   * Process callback function on each children components
   * @param callback
   * @protected
   */
  private onChildrenComponents(callback: (component) => void): void {
    Object.keys(this)?.forEach((child) => {
      const curr = this?.[child]
      if (Array.isArray(curr)) {
        curr.forEach((c) => {
          if (c instanceof Component) {
            callback(c)
          }
        })
      } else if (curr instanceof Component) {
        callback(curr)
      }
    })
  }

  /**
   * Return component name from data attr
   * This string name need to be de same than the Class component name
   * @param $node
   */
  private static getComponentName($node: HTMLElement): string {
    return $node?.getAttribute?.(COMPONENT_ATTR)
  }

  /**
   * Get component ID
   * @param $node
   */
  private static getComponentId($node: HTMLElement): number {
    return $node?.getAttribute?.(ID_ATTR) && parseInt($node.getAttribute(ID_ATTR))
  }

  /**
   *  Watch children components changed
   */
  private _watchChildren(): void {
    const onChange = (mutationsList) => {
      for (const mutation of mutationsList) {
        // add node actions
        // TODO do we have to do something when a component is inject in DOM?

        // remove nodes actions
        for (const node of mutation.removedNodes) {
          const nodeRemovedId = Component.getComponentId(node)
          if (!nodeRemovedId) return

          this.onChildrenComponents((component) => {
            if (!component) return
            if (nodeRemovedId === component?.id && component?.isMounted) {
              component._unmounted()
              component.observer.disconnect()
            }
          })
        }
      }
    }

    this.observer = new MutationObserver(onChange)

    if (this.$root) {
      this.observer.observe(this.$root, {
        subtree: true,
        childList: true,
      })
    }
  }
}
