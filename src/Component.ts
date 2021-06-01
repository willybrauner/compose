type TFlat<T> = T extends any[] ? T[number] : T;

const componentName = "Component";
const debug = require("debug")(`composition:${componentName}`);
let COMPONENT_ID = 0;
const COMPONENTS_LIST = [];

/**
 * Component
 */
export default class Component {

  public static DATA_COMPONENT_ATTR = "data-component";
  public static DATA_COMPONENT_ID_ATTR = "data-component-id";

  public name: string;
  public $root: HTMLElement;
  public children: { [x: string]: any };

  protected observer: MutationObserver;

  constructor(name: string) {
    this.name = name;
    this.$root = Component.getDomElement(this.name)[0];
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
  protected updated(mutation): void {}


  /**
   * Register component
   */
  protected register<T>(
    classComponent: new (name: string) => TFlat<Component>,
    name: string
  ): T {
    let local = [];
    const elements = Component.getDomElement(name);
    if (!elements || elements.length === 0) {
      return undefined;
    }

    for (const element of elements) {
      const id = COMPONENT_ID++;

      const classInstance: TFlat<Component> = new classComponent(name);

      classInstance.$root.setAttribute(Component.DATA_COMPONENT_ID_ATTR, `${id}`);
      COMPONENTS_LIST.push(classInstance);
      local.push(classInstance);
    }

    return local.length === 1 ? local[0] : local;
  }

  // ------------------------------------------------------------------------------------- CORE

  /**
   * Unmount children components
   */
  private unmountChildren(): void {
    this.children &&
      Object.keys(this.children).forEach((c) => {
        const child = this.children?.[c];
        if (!child) return;

        if (Array.isArray(child)) {
          child?.forEach((el) => el.unmounted());
          // TODO remove from global arr
        } else {
          child?.unmounted();
          // TODO remove from global arr
        }
      });
  }

  /**
   * Get DOM
   */
  private static getDomElement(name: string): HTMLElement[] {
    return [
      // @ts-ignore
      ...((this.$root || document).querySelectorAll(
        `*[${Component.DATA_COMPONENT_ATTR}=${name}]`
      ) || []),
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
        const isRootNode = (node) =>
          node.getAttribute(Component.DATA_COMPONENT_ATTR) === this.name;

        for (const node of mutation.addedNodes) {
          if (isRootNode(node)) {
            debug("has been added", node);
            this.mounted();
          }
        }
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
