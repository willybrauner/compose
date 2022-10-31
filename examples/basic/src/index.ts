import "./index.css"
import { App } from "./components/App"
import { history } from "./history"

const app = new App({
  $root: document.querySelector<HTMLElement>(".App"),
  props: { foo: "bar" },
  history,
})
