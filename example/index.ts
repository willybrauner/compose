import "./index.css";
import App from "./components/App";
const componentName = "index";
const debug = require("debug")(`front:${componentName}`);

// ------------------------------------------------

new App(document.querySelector(".App"), {});
