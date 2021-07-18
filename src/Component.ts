export type TComponents = {
  [name: string]: Component | Component[];
};
export type TElements = {
  [x: string]: HTMLElement | HTMLElement[];
};
type TFlatArray<T> = T extends any[] ? T[number] : T;
export type TClassComponent = new <P>(
  $root?: HTMLElement,
  props?: P,
  attrName?: string
) => Component;
type TProps = { [x: string]: any } | void;

// globals
let COMPONENT_ID = 0;
const COMPONENT_NAME = "Component";
const debug = require("debug")(`front:${COMPONENT_NAME}`);

/**
 * Component
 */
export default class Component<Props = TProps> {
  public name: string;
  public $root: HTMLElement;
  public props: Props;
  protected components: TComponents;
  protected elements: TElements;
  protected observer: MutationObserver;
  protected id: number;
  protected isMounted: boolean;
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
    this.name = attrName || this.getComponentName();
    debug("this.name construct", this.name);
    // set ID on DOM element
    this.$root.setAttribute(Component.idAttr, `${COMPONENT_ID}`);
    this.id = COMPONENT_ID;
    COMPONENT_ID++;
  }

  /**
   * Init to call in contructor (to keep context)
   */
  protected init() {
    this.beforeMount();
    this.mounted();
    this.watchChildren();
  }

  protected beforeMount(): void {}

  /**
   * When component is mounted
   */
  protected mounted(): void {
    this.isMounted = true;
    debug("MOUNTED!", this.name);
  }

  /**
   * When component is unmounted
   * - execute unmounted() method of components
   */
  protected unmounted(): void {
    this.isMounted = false;
    debug("UNMOUNTED", this.name);
    this.onChildrenComponents((component: Component) => component?.unmounted?.());
  }

  /**
   * Callback of watch method execute each time children DOM nodes changed
   */
  protected updated(mutation: MutationRecord): void {}

  /**
   * Add is a register child component function
   * It create new children instance
   */
  protected add<T, P = Props>(
    classComponent: TClassComponent,
    props?: P,
    attrName?: string
  ): T {
    // prepare instances array
    const localInstances = [];

    // get string name instance
    const name: string = classComponent?.["attrName"] || attrName;
    debug("add name", name);

    // get DOM elements
    const elements = this.getDomElement(this.$root, name);
    debug("elements: ", elements);

    // if no elements, exit
    if (!elements.length) return;

    // map on each elements (because elements return an array)
    for (let i = 0; i < elements.length; i++) {
      // create child instance
      let classInstance: TFlatArray<Component> = new classComponent<P>(
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
    if (!className || !bemElementName || !this.$root) return;
    // query elements
    const elements = this.$root.querySelectorAll(`.${className}_${bemElementName}`);
    // check
    if (!elements.length) return;
    // transform to array
    const formatElements: T = Array.from(elements) as T;
    // return 1 element or array of elements
    return (formatElements as any).length === 1 ? formatElements[0] : formatElements;
  }

  // ------------------------------------------------------------------------------------- CORE

  /**
   * Get DOM element
   */
  private getDomElement($root: HTMLElement, name: string): HTMLElement[] {
    return [
      // @ts-ignore
      ...($root?.querySelectorAll(`*[${this.componentAttr}=${name}]`) || []),
    ];
  }

  /**
   * Process callback function on each children component
   * @param callback
   * @protected
   */
  private onChildrenComponents(callback: (component: Component) => void): void {
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
  protected getComponentName = ($node: HTMLElement = this.$root): string =>
    $node?.getAttribute(Component.componentAttr);

  /**
   * Get component ID
   * @param $node
   */
  protected getComponentId = ($node: HTMLElement): number =>
    $node?.getAttribute(Component.idAttr) &&
    parseInt($node.getAttribute(Component.idAttr));

  /**
   *  Watch component changes
   */
  private watchChildren(): void {
    const onChange = (mutationsList) => {
      for (const mutation of mutationsList) {
        // add node actions
        for (const node of mutation.addedNodes) {
          const nodeAddedId = this.getComponentId(node);
          if (!nodeAddedId) return;

          this.onChildrenComponents((component: Component) => {
            // prettier-ignore
            if (!component.isMounted) {
              // TODO voir si on devrait pas le register plutot ?
              debug("!!! has been addded", { name: component, isMounted: component.isMounted, node })
              component.mounted()
            }
          });
        }

        // remove nodes actions
        for (const node of mutation.removedNodes) {
          const nodeRemovedId = this.getComponentId(node);
          if (!nodeRemovedId) return;

          this.onChildrenComponents((component: Component) => {
            if (nodeRemovedId === component.id && component.isMounted) {
              // prettier-ignore
              debug("!!! has been removed", { name: component, isMounted: component.isMounted, node })
              component.unmounted();
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
