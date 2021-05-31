const componentName = "Component";
const debug = require("debug")(`composition:${componentName}`);

export type TRegister = {
  $root: HTMLElement;
  instance: any;
  id: number;
};

/**
 * Store
 */
let COMPONENT_ID = 0;
const COMPONENTS_LIST = [];

/**
 * Component
 */
export default class Component {
  public static DATA_COMPONENT_ATTR = "data-component";
  public static DATA_COMPONENT_ID_ATTR = "data-component-id";

  protected name: string;
  protected $root: HTMLElement;
  protected children: { [x: string]: any };
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
    this.mount();
    this.watch();
  }

  protected beforeMount(): void {}

  /**
   * When component is mounted
   */
  protected mount(): void {}

  /**
   * When component is unmounted
   * - execute unmount() method of children components
   */
  protected unmount(): void {
    this.unmountChildren();
  }

  /**
   * Callback of watch method execute each time current DOM node change
   */
  protected onUpdate(mutation): void {}

  /**
   * Get nested component
   */
  protected register<T = TRegister | TRegister[]>(
    dataComponentName: string,
    classComponent: any
  ): T | undefined {
    let local = [];
    const elements = Component.getDomElement(dataComponentName);

    if (!elements) {
      return undefined;
    }

    for (const element of elements) {
      const id = COMPONENT_ID++;
      let compo: TRegister = {
        $root: element,
        instance: new classComponent(dataComponentName),
        id,
      };

      compo.$root.setAttribute(Component.DATA_COMPONENT_ID_ATTR, `${id}`);
      COMPONENTS_LIST.push(compo);
      local.push(compo);
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

        if (Array.isArray(child as TRegister)) {
          child?.forEach((el) => el.instance.unmount());
          // TODO remove from global arr
        } else {
          (child as TRegister)?.instance.unmount();
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
            this.mount();
          }
        }
        for (const node of mutation.removedNodes) {
          if (isRootNode(node)) {
            debug("has been removed", node);
            this.unmount();
            this.observer.disconnect();
          }
        }
        // each time some
        this.onUpdate(mutation);
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
