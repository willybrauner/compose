import "./index.css";
import App from "./components/App";
const componentName = "index";
const debug = require("debug")(`composition:${componentName}`);

// ------------------------------------------------

new App("App");
