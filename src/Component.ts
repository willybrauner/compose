const componentName = "Component"
const debug = require("debug")(`composition:${componentName}`)

export default class Component {

  public $element: HTMLElement
  public static readonly DATA_COMPONENT_ATTR = "data-component"
  protected _name: string
  private _components: { [x: string]: any }
  private _instances: Component[] = [];

  constructor(name: string)
  {
    // get component name from constructor
    this._name = name

    // get dom element
    this.$element = this.getDomElement()

    // get availables components
    this._components = this.components()

    // prepare components
    this.prepareComponents();

    this.mount();
  }

  // --------------------------------------------------------------------------- LOCAL


  /**
   * Get DOM element from data-component attr
   * TODO le querySelector doit se faire depuis le root
   */
  private getDomElement(name = this._name, attr = Component.DATA_COMPONENT_ATTR): HTMLElement
  {
    return document.querySelector(`*[${attr}=${name}]`)
  }

  /**
   * On veut mount tous les sous composants et les stocker dans une locale
   */
  private prepareComponents(): void
  {
    if (!this._components) return
    Object.keys(this._components).forEach((name) =>
    {
      this._instances = [
        ...this._instances,
        new this._components[name](`${name}`),
      ]
    })
  }

  /**
   *
   * @private
   */
  private mountComponents(): void
  {
    debug(this._name, this._instances)
    this._instances?.forEach(instance => instance?.mount())
  }

  /**
   *
   * @private
   */
  private unmountComponents(): void
  {
    this._instances?.forEach(instance => instance?.unmount())
  }

  // --------------------------------------------------------------------------- API

  /**
   * Register components inside current instance
   */
  public components(): { [x: string]: any }
  {
    return
  }

  /**
   * When component is mounted
   */
  public mount(): void
  {
      this.mountComponents();
  }

  /**
   * When component is unmount
   */
  public unmount(): void
  {
    this.unmountComponents();
    debug(this._name, 'unmount')
  }

  /**
   *  Watch component via observer
   *  TODO Besoin de watch si l'instance a été mount ou unmount
   */
  public watch(): void
  {

  }


}
