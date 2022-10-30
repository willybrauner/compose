import { Component } from "@wbe/compose";
import debug from "@wbe/debug"
const log = debug(`front:Footer`)

type TProps = {}

/**
 * @name Footer
 */
export default class Footer extends Component<TProps> {
  public static attrName = "Footer";
  mounted () {
    log('Footer is mounted', this)
  }

  logMe() {
    log("Log Me!", this)
  }
}
