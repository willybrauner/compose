---
sidebar_position: 1
title: instance
---

In order to use `Component`, set `data-component` name attribute on specific DOM element:

```html
<div data-component="App">
  <header data-component="Header">Header content</header>
</div>
```

Create a class extended by `Component`:

```js
import { Component } from "@wbe/compose"

class App extends Component {
  static attrName = "App" // same value than `data-component` attribute
}
```

Then, start component instances chaining by root instance.

```js
new App(document.querySelector(".App"))
```

Each Component like `Header` child class component, need to extend `Component` class:

```js
import { Component } from "@wbe/compose"

class Header extends Component {
  static attrName = "Header"

  mounted() {
    window.addEventListener("resize", this.handleResize)
  }

  unmounted() {
    window.removeEventListener("resize", this.handleResize)
  }

  handleResize = () => {
    // do something on resize...
  }
}
```

And because `Header` component is a App child component, it can be instantiated from `App` class:

```js
class App extends Component {
  static attrName = "App"
  header = this.add(Header)
}
```

### attrName

static `string`

`attrName` need to be the name value of `data-component` attribute related to the instance.
This one is used by `Component` extended class, to target current $root element.

example:

If the attribute is declared "Foo" on DOM `<div data-component="Foo" />`, `attrName`
need to be `Foo` too.

```js
class Foo extends Component {
  static attrName = "Foo"
  // ...
}
```
