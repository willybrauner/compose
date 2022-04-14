import type { TPromiseRef } from "./Stack"
import debug from "@wbe/debug"
const log = debug(`compose:Component`)

export type TProps = { [x: string]: any } | void
export type TFlatArray<T> = T extends any[] ? T[number] : T
export type TNewComponent<C, P> = new <P = TProps>(...rest: any[]) => TFlatArray<C>
export type TTransition = {
  comeFrom?: string
  goTo?: string
  promiseRef?: TPromiseRef
}

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
  private isMounted: boolean

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
    this.name = attrName || this.getComponentName(this.$root)

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
   * Before mounted
   */
  public beforeMount(): void {}
  private _beforeMount(): void {
    this.beforeMount()
  }

  /**
   * When component is mounted
   */
  public mounted(): void {}
  private _mounted(): void {
    log(this.name, "mounted")
    this.mounted()
    this.isMounted = true
  }

  /**
   * When component is unmounted
   * Will execute unmounted() method of children components
   */
  public unmounted() {}
  private _unmounted(): void {
    this.unmounted()
    this.isMounted = false
    this.onChildrenComponents((component: Component) => {
      COMPONENT_ID--
      component?._unmounted()
    })
    log(this.name, "UNmounted")
  }

  /**
   * Add is a register child component function
   * It create new children instance
   */
  protected add<T = any, P = TProps>(
    classComponent: TNewComponent<T, P>,
    props?: P,
    returnArray?: boolean,
    attrName?: string
  ): T {
    // prepare instances array
    const localInstances = []
    // get string name instance from from param or static attrName property
    const name: string = attrName || classComponent?.["attrName"]
    // get DOM elements
    const elements = this.getDomElement(this.$root, name)
    // if no elements, exit
    if (!elements.length) return
    // map on each elements (because elements return an array)
    for (let i = 0; i < elements.length; i++) {
      // create child instance
      const classInstance: T = new classComponent<P>(
        elements[i],
        {
          ...props,
          key: i,
          parentId: this.id,
        },
        name
      )
      // push it store and local list
      localInstances.push(classInstance)
    }
    // return single instance or instances array
    return localInstances.length === 1 && !returnArray ? localInstances[0] : localInstances
  }

  /**
   * Find HTML element with BEM element name
   * ex:
   *  if class name is "Block_section"
   *  this.find("section") will return DOM element with "Block_section" class
   */
  protected find<T extends HTMLElement | HTMLElement[]>(
    bemElementName: string,
    returnArray: boolean = false,
    className = this.$root?.classList?.[0]
  ): T {
    // check and exit
    if (!className || !bemElementName || !this.$root) return
    // query elements
    const elements = this.$root.querySelectorAll(`.${className}_${bemElementName}`)

    if (!elements.length) return
    // transform to array
    const formatElements: T = Array.from(elements) as T
    // return 1 element or array of elements
    return (formatElements as any).length === 1 && !returnArray ? formatElements[0] : formatElements
  }

  // ------------------------------------------------------------------------------------- TRANSITIONS

  /**
   * PlayIn Ref used by stack
   * Stack need to access promiseRef object
   * @param comeFrom
   * @param promiseRef
   */
  public _playInRef(comeFrom?: string, promiseRef?: { reject: () => void }): Promise<void> {
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
   * PlayOut Ref used by stack
   * Stack need to access promiseRef object
   * @param goTo
   * @param promiseRef
   */
  public _playOutRef(goTo?: string, promiseRef?: { reject: () => void }): Promise<void> {
    return new Promise((resolve, reject) => {
      promiseRef.reject = () => reject()
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
  private getDomElement($root: HTMLElement, name: string): HTMLElement[] {
    return [
      // @ts-ignore
      ...($root?.querySelectorAll(`*[${COMPONENT_ATTR}=${name}]`) || []),
    ]
  }

  /**
   * Process callback function on each children components
   * @param callback
   * @protected
   */
  private onChildrenComponents(callback: (component) => void): void {
    Object.keys(this)?.forEach((child) => {
      const curr = this?.[child]
      if (Array.isArray(curr) )
      {
        curr.forEach(c => {
          if (c instanceof Component) {
            callback(c)
         }
        })
      }
      else if (curr instanceof Component) {
         callback(curr)
      }
    })
  }

  /**
   * Return component name from data attr
   * This string name need to be de same than the Class component name
   * @param $node
   */
  private getComponentName($node: HTMLElement = this.$root): string {
    return $node?.getAttribute?.(COMPONENT_ATTR)
  }

  /**
   * Get component ID
   * @param $node
   */
  private getComponentId($node: HTMLElement): number {
    return $node?.getAttribute?.(ID_ATTR) && parseInt($node.getAttribute(ID_ATTR))
  }

  /**
   *  Watch children components changed
   */
  private _watchChildren(): void {
    const onChange = (mutationsList) => {
      for (const mutation of mutationsList) {
        // add node actions
        for (const node of mutation.addedNodes) {
          const nodeAddedId = this.getComponentId(node)
          if (!nodeAddedId) return

          this.onChildrenComponents((component) => {
            if (!component) return
            if (!component?.isMounted) {
              // TODO voir si on devrait pas le register plutot ?
              component._mounted()
            }
          })
        }
        // remove nodes actions
        for (const node of mutation.removedNodes) {
          const nodeRemovedId = this.getComponentId(node)
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
