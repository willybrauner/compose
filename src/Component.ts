import { TPromiseRef } from "./Stack";

type TFlatArray<T> = T extends any[] ? T[number] : T;

export type TNewComponent<C, P> = new <P = TProps>(...rest: any[]) => TFlatArray<C>;

export type TProps = { [x: string]: any } | void;

export type TComponents = {
  [name: string]: any | any[];
};

export type TElements = {
  [x: string]: HTMLElement | HTMLElement[];
};

/**
 * Glob scope
 */
let COMPONENT_ID = 0;

/**
 * default transitions used as specific page transitions methods
 * on each page used by stack
 */
export interface IPageTransitions {
  playIn({
    $root,
    goFrom,
  }: {
    $root: HTMLElement;
    goFrom?: string;
    promiseRef: TPromiseRef;
  }): Promise<void>;
  playOut({
    $root,
    goTo,
  }: {
    $root: HTMLElement;
    goTo?: string;
    promiseRef: TPromiseRef;
  }): Promise<void>;
}

/**
 * Component
 */
export class Component<Props = TProps> {
  public name: string;
  public $root: HTMLElement;
  public props: Props;
  public components: TComponents;
  public elements: TElements;
  public id: number;
  public isMounted: boolean;
  private observer: MutationObserver;
  public static componentAttr: string = "data-component";
  public static idAttr: string = "data-component-id";

  /**
   * @param $root Dom element link with the instance
   * @param props Object properties of the instance
   * @param attrName is value from data-component="{name}"
   */
  constructor($root?: HTMLElement, props?: Props, attrName?: string) {
    this.props = props;
    this.$root = $root;
    this.name = attrName || this.getComponentName(this.$root);

    // set ID on DOM element
    this.$root.setAttribute(Component.idAttr, `${COMPONENT_ID}`);
    this.id = COMPONENT_ID;
    COMPONENT_ID++;
  }

  /**
   * Init to call in contructor (to keep context)
   */
  protected init() {
    this._beforeMount();
    this._mounted();
    this._watchChildren();
  }

  /**
   * Before mounted
   */
  public beforeMount(): void {}
  private _beforeMount(): void {
    this.beforeMount();
  }

  /**
   * When component is mounted
   */
  public mounted(): void {}
  private _mounted(): void {
    this.isMounted = true;
    this.mounted();
  }

  /**
   * When component is unmounted
   * Will execute unmounted() method of children components
   */
  public unmounted() {}
  private _unmounted(): void {
    this.isMounted = false;
    this.unmounted();
    this.onChildrenComponents((component: Component) => {
      COMPONENT_ID--;
      component?._unmounted?.();
    });
  }

  /**
   * Callback of watch method execute each time children DOM nodes changed
   */
  public updated(mutation: MutationRecord): void {}

  /**
   * Add is a register child component function
   * It create new children instance
   */
  protected add<T = any, P = TProps>(
    classComponent: TNewComponent<T, P>,
    props?: P,
    attrName?: string,
    returnArray: boolean = false
  ): T {
    // prepare instances array
    const localInstances = [];
    // get string name instance from from param or static attrName property
    const name: string = attrName || classComponent?.["attrName"];
    // get DOM elements
    const elements = this.getDomElement(this.$root, name);
    // if no elements, exit
    if (!elements.length) return;
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
      );
      // push it store and local list
      localInstances.push(classInstance);
    }
    // return single instance or instances array
    return localInstances.length === 1 && !returnArray ? localInstances[0] : localInstances;
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
    if (!className || !bemElementName || !this.$root) return;
    // query elements
    const elements = this.$root.querySelectorAll(`.${className}_${bemElementName}`);

    if (!elements.length) return;
    // transform to array
    const formatElements: T = Array.from(elements) as T;
    // return 1 element or array of elements
    return (formatElements as any).length === 1 && !returnArray
      ? formatElements[0]
      : formatElements;
  }

  // ------------------------------------------------------------------------------------- CORE

  /**
   * Get DOM element
   */
  private getDomElement($root: HTMLElement, name: string): HTMLElement[] {
    return [
      // @ts-ignore
      ...($root?.querySelectorAll(`*[${Component.componentAttr}=${name}]`) || []),
    ];
  }

  /**
   * Process callback function on each children component
   * @param callback
   * @protected
   */
  private onChildrenComponents(callback: (component) => void): void {
    this.components &&
      Object.keys(this.components).forEach((component) => {
        const child = this.components?.[component];
        Array.isArray(child) ? child?.forEach((c) => callback(c)) : callback(child);
      });
  }

  /**
   * Return component name from data attr
   * This string name need to be de same than the Class component name
   * @param $node
   */
  private getComponentName($node: HTMLElement = this.$root): string {
    return $node?.getAttribute(Component.componentAttr);
  }

  /**
   * Get component ID
   * @param $node
   */
  private getComponentId($node: HTMLElement): number {
    return $node?.getAttribute(Component.idAttr) && parseInt($node.getAttribute(Component.idAttr));
  }

  /**
   *  Watch children components changed
   */
  private _watchChildren(): void {
    const onChange = (mutationsList) => {
      for (const mutation of mutationsList) {
        // add node actions
        for (const node of mutation.addedNodes) {
          const nodeAddedId = this.getComponentId(node);
          if (!nodeAddedId) return;

          this.onChildrenComponents((component) => {
            if (!component.isMounted) {
              // TODO voir si on devrait pas le register plutot ?
              component.mounted();
            }
          });
        }
        // remove nodes actions
        for (const node of mutation.removedNodes) {
          const nodeRemovedId = this.getComponentId(node);
          if (!nodeRemovedId) return;

          this.onChildrenComponents((component) => {
            if (component && nodeRemovedId === component?.id && component.isMounted) {
              component._unmounted();
              component.observer.disconnect();
            }
          });
        }

        this.updated(mutation);
      }
    };

    this.observer = new MutationObserver(onChange);

    if (this.$root) {
      this.observer.observe(this.$root, {
        subtree: true,
        childList: true,
      });
    }
  }
}
