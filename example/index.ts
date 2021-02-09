import "./index.css";
import App from "./components/App";

console.log("Hello Composition!");

const app = new App("App");

const toggleButton = document.getElementById("MainButton");
let toggle = true;
toggleButton.onclick = () => {
  toggle = !toggle;
  toggle ? app.mount() : app.unmount();
};
