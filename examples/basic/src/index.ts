import "./index.css";
import {App} from "./components/App"
import {history} from "./history"

const $root = document.querySelector<HTMLElement>(".App");
const props =  { foo: "bar" }

const app = new App({$root, props, history});

