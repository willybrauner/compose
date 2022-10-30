import { Component } from "../../../src";
import debug from "@wbe/debug"
const log = debug(`front:Footer`)

type TProps = {}

/**
 * @name Footer
 */
export default class Footer extends Component<TProps> {
  public static attrName = "Footer";
  mounted () {
    log('Footer is mounted')
  }

  unmounted () {}

  logMe()
  {
    log("Log Me!", this)
  }


}
