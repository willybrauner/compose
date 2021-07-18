const componentName = "Component";
const debug = require("debug")(`front:${componentName}`);

type TRegister = {
  name: string;
  componentInstance: (e: TInstanceParams) => any;
};

export type TInstanceParams = {
  element?: HTMLElement;
  children?: HTMLElement[];
  onDestroy?: () => void;
};

class Component {
  protected COMPONENT_ATTR = "data-component";
  protected ID_ATTR = "data-component-id";

  protected componentsList: TRegister[] = [];
  protected componentId = 0;

  /**
   * push in list name + fn
   */
  register(
    name: string,
    componentInstance: ({ element, children, onDestroy }: TInstanceParams) => void
  ) {
    this.componentsList.push({ name, componentInstance });
    debug("this.componentList", this.componentsList);
  }

  /**
   * Mount all children of specific node
   */
  mount($root: HTMLElement = document.body, depth = 0): HTMLElement[] {
    debug("> mount root", $root);
    const localComponents = [];

    const childrenComponents = [
      // @ts-ignore
      ...$root.querySelectorAll(`[${this.COMPONENT_ATTR}]:not([${this.ID_ATTR}])`),
    ];

    if (childrenComponents.length === 0) return;
    debug("start loop -----------", childrenComponents);

    // pour chaque composant enfant
    for (const childComponent of childrenComponents) {
      // get name
      const componentName = childComponent.dataset[`component`];

      // get current component register in component array
      const current = this.componentsList.find(
        (component) => component.name === componentName
      );

      // if component exist in registered components
      if (current) {
        // if there is attr, continue to next iteration
        if (childComponent.hasAttribute(`${this.ID_ATTR}`)) continue;

        // mount recursivly from child
        const children = this.mount(childComponent, depth + 1);

        // increment id
        let id = this.componentId++;

        // prepare component
        const prepare = this.prepareComponent({
          id,
          name: componentName,
          element: childComponent,
          children,
          componentInstance: current.componentInstance,
        });

        // @ts-ignore
        localComponents.push(prepare, ...(children || []));
      }
    }

    return localComponents;
  }


  /**
   * Prepare component array
   * @param id
   * @param name
   * @param element
   * @param children
   * @param componentInstance
   * @private
   */
  private prepareComponent({
    id,
    name,
    element,
    children,
    componentInstance,
  }: {
    id: number;
    name: string;
    element: HTMLElement;
    componentInstance: ({ element, children, onDestroy }: TInstanceParams) => any;
    children: HTMLElement[];
  }) {
    const destroy = () => {
      element.removeAttribute(this.ID_ATTR);
    };
    const onDestroy = (fn = () => {}) => {
      fn();
      destroy();
    };
    const instance = componentInstance({ element, children, onDestroy });

    return {
      id,
      name,
      children,
      destroy,
      onDestroy,
      instance,
    };
  }

  /**
   * Unmount All
   */
  unmount() {}
}

export default new Component();
