const componentName = "Component";
const debug = require("debug")(`front:${componentName}`);

export default class Component {
  protected $element: HTMLElement;
  protected name: string;
  protected static DATA_COMPONENT_ATTR = "data-component";

  constructor(name: string, autoMount = true, autoUnmount = true) {
    this.name = name;
    this.$element = this.getDomElement();

    if (autoMount) this.mount();

    // TODO use watch
    if (autoUnmount) {
    }
  }

  public components() {}

  /**
   * When component is mounted
   */
  public mount(): void {}

  /**
   * When component is unmount
   * observer.disconnect();
   */
  public unmount(): void {}

  /**
   *  Watch component via observer
   *  TODO Besoin de watch si l'instance a été mount ou unmount
   */
  public watch(element = this.$element) {}

  /**
   * Get DOM element from data-component attr
   * TODO le querySelector doit se faire depuis le root
   */
  private getDomElement(
    name = this.name,
    attr = Component.DATA_COMPONENT_ATTR
  ): HTMLElement {
    return document.querySelector(`*[${attr}=${name}]`);
  }
}
