---
sidebar_position: 1
title: DOM link
---

## Link JS class to DOM element

1. In order to link your javascript class to your DOM, set `data-component` name attribute on specific DOM element.

```html
<div data-component="App">App</div>
```

2. Create a class extended by `Component`.
   `attrName` should get the same value that `data-component` attribute.

```js
import { Component } from "@wbe/compose"

class App extends Component {
  static attrName = "App"
}
```

3. Then, start component instances chaining by root instance.

```js
new App(document.querySelector(".App"))
```

## Children components

Compose as been design in order to support atomic design development. Children component of App can be instantiated from app.
We add `Header` component as `App` child in DOM.

```html
<div data-component="App">
  <header data-component="Header"></header>
</div>
```

`Header.js`:

```js
class Header extends Component {
  static attrName = "Header"
}
```

Now, app is able to "add" (instantiate) `Header` class component.

```js
class App extends Component {
  static attrName = "App"
   // highlight-next-line
  header = this.add(Header)
}
```

:::info
The goal is to keep and maintain the same parent/children relation structure in the DOM and in the Javascript class import order.
:::

## attrName

static `string`

`attrName` need to be the name value of `data-component` attribute related to the instance.
This one is used by `Component` extended class, to target current $root element.

example:

If the attribute is declared "Foo" on DOM `<div data-component="Foo" />`, `attrName`
need to be `Foo` too.

```js
class Foo extends Component {
   // highlight-next-line
   static attrName = "Foo"
}
```
