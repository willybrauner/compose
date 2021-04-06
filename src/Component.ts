const componentName = "Component"
const debug = require("debug")(`composition:${componentName}`)


const DATA_COMPONENT_ATTR = "data-component";

const getElement = (name: string, attr = DATA_COMPONENT_ATTR): HTMLElement => {
  return document.querySelector(`*[${attr}=${name}]`)
}

export const compo = (name:string, instance: any) => ({
  $root: getElement(name),
  instance: new instance(name)
})


// -------

export default class Component {

  public $root: HTMLElement

  constructor(name) {
    this.$root = getElement(name);
    const mount = this.mount.bind(this);
  }

  /**
   * When component is mounted
   */
  public mount(): void {}

  /**
   * When component is unmount
   */
  public unmount(): void {}

  /**
   *  Watch component via observer
   *  TODO Besoin de watch si le noeuf DOM a changé
   */
  public watch(): void {}

}
