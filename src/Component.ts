type TFlat<T> = T extends any[] ? T[number] : T;
type TClassComponent = new (name: string) => Component;

const componentName = "Component";
const debug = require("debug")(`composition:${componentName}`);

// stores
let COMPONENT_ID = 0;

/**
 * Component
 */
export default class Component {
  public name: string;
  public $root: HTMLElement;
  public children: { [x: string]: Component | Component[] };

  protected observer: MutationObserver;
  protected componentAttr = "data-component";
  protected idAttr = "data-component-id";

  constructor(name: string) {
    this.name = name;
    this.$root = this.getDomElement(this.name)?.[0];
  }

  /**
   * Init to call in contructor (to keep context)
   */
  protected init() {
    this.beforeMount();
    this.mounted();
    this.watch();
  }

  protected beforeMount(): void {}

  /**
   * When component is mounted
   */
  protected mounted(): void {}

  /**
   * When component is unmounted
   * - execute unmounted() method of children components
   */
  protected unmounted(): void {
    this.unmountChildren();
  }

  /**
   * Callback of watch method execute each time current DOM node change
   */
  protected updated(mutation: MutationRecord): void {}

  /**
   * Register component
   */
  protected register<T>(classComponent: TClassComponent, name: string): T {
    // prepare instances array
    const localInstances = [];
    // get DOM elements
    const elements = this.getDomElement(name);
    // if no elements, exit
    if (!elements.length) return;

    // map elements
    for (const element of elements) {
      // increment ID
      const id = COMPONENT_ID++;
      // create child instance
      const classInstance: TFlat<Component> = new classComponent(name);
      // set ID on child DOM element
      classInstance.$root.setAttribute(this.idAttr, `${id}`);
      // push it store and local list
      localInstances.push(classInstance);
    }

    // return single instance or instances array
    return localInstances.length === 1 ? localInstances[0] : localInstances;
  }

  /**
   * Find HTML element with BEM element name
   * ex:
   *  if class name is "Block_section"
   *  this.find("section") will return DOM element with "Block_section" class
   */
  protected find<T extends HTMLElement | HTMLElement[]>(
    bemElementName: string,
    className = this.$root?.classList?.[0]
  ): T {
    // check and exit
    if (!className || !bemElementName) return;
    // query elements
    const elements = this.$root.querySelectorAll(`.${className}_${bemElementName}`);
    debug('elemeslslnts',elements)

    // check
    if (!elements.length) return;
    // transform to array
    const formatElements: T = Array.from(elements) as T;
    // return 1 element or array of elements
    return (formatElements as any).length === 1 ? formatElements[0] : formatElements;
  }

  // ------------------------------------------------------------------------------------- CORE

  /**
   * Unmount children components
   */
  private unmountChildren(): void {
    this.children &&
      Object.keys(this.children).forEach((component) => {
        const child = this.children?.[component];
        if (!child) return;

        if (Array.isArray(child)) {
          child?.forEach((el) => el.unmounted());
        } else {
          (child as any)?.unmounted();
        }
      });
  }

  /**
   * Get DOM element
   */
  private getDomElement(name: string): HTMLElement[] {
    return [
      // @ts-ignore
      ...((this.$root || document).querySelectorAll(`*[${this.componentAttr}=${name}]`) ||
        []),
    ];
  }

  /**
   *  Watch component changes
   */
  private watch(): void {
    const onChange = (mutationsList) => {
      // map on mutations
      for (const mutation of mutationsList) {
        // define what is root node (because target is parent of $root)
        const isRootNode = (node) => node.getAttribute(this.componentAttr) === this.name;

        // add nodes action
        for (const node of mutation.addedNodes) {
          if (isRootNode(node)) {
            debug("has been added", node);
            this.mounted();
          }
        }

        // remove nodes action
        for (const node of mutation.removedNodes) {
          if (isRootNode(node)) {
            debug("has been removed", node);
            this.unmounted();
            this.observer.disconnect();
          }
        }
        // each time some
        this.updated(mutation);
      }
    };

    this.observer = new MutationObserver(onChange);

    if (this.$root?.parentNode) {
      this.observer.observe(this.$root.parentNode, {
        subtree: true,
        childList: true,
      });
    }
  }
}
