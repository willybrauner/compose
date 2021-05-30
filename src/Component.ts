const componentName = "Component";
const debug = require("debug")(`composition:${componentName}`);

export type TRegister = {
  $root: HTMLElement;
  instance: any;
  id: number;
};

// --------------------------------------------------------------------------------------- GLOBAL

let COMPONENT_ID = 0;
const COMPONENTS_LIST = [];

// --------------------------------------------------------------------------------------- CLASS

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
    this.onMount();
    this.watch();
  }

  /**
   * When component is mounted
   */
  protected onMount(): void {}

  /**
   * When component is unmounted
   * - execute onUnmount() method of children components
   */
  protected onUnmount(): void {
    this.children &&
      Object.keys(this.children).forEach((c) => {
        const child = this.children?.[c];
        if (!child) return;

        if (Array.isArray(child as TRegister)) {
          child?.forEach((el) => el.instance.onUnmount());
        } else {
          (child as TRegister)?.instance.onUnmount();
        }
      });
  }

  /**
   * Callback of watch method execute each time current DOM node change
   */
  protected onChange(mutation): void {}

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
            this.onMount();
          }
        }
        for (const node of mutation.removedNodes) {
          if (isRootNode(node)) {
            debug("has been removed", node);
            this.onUnmount();
            this.observer.disconnect();
          }
        }
        // each time some
        this.onChange(mutation);
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
