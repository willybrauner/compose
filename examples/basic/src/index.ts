import "./index.css"
import { App } from "./components/App"

const app = new App({
  $root: document.querySelector<HTMLElement>(".App"),
  props: { foo: "bar" }
})
