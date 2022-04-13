# @wbe/compose

Compose is a tiny zero dependency library for vanilla javascript component approach and page transitions management.

> This library is work in progress, the API is subject to change drastically until the v1.0 release.

![](https://img.shields.io/npm/v/@wbe/compose/latest.svg)
![](https://img.shields.io/bundlephobia/minzip/@wbe/compose.svg)
![](https://img.shields.io/npm/dt/@wbe/compose.svg)
![](https://img.shields.io/npm/l/@wbe/compose.svg)

[test @wbe/compose in codesandbox](https://codesandbox.io/s/compose-example-ts-xdz1q6)

## Installation

```shell
$ npm install -s @wbe/compose
```

## `Component` extended class

Set `data-component` name attribute on specific DOM element:

```html
<div class="App" data-component="App">
  <h1 class="App_title">...</h1>
  <header class="Header" data-component="Header">...</header>
</div>
```

Create a class called as `data-component` attribute:

```js
import { Component } from "@wbe/compose"
import Header from "Header"

class App extends Component {
  // same value than `data-component` attribute
  static attrName = "App"
}
```

Then, start component instances chaining by root instance.

```js
const $app = document.querySelector(".App")
new App($app)
```

Each Component like `Header` child class component, need to extends the same `Component` class.

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

## Life cycle

### beforeMount

`beforeMount()`

Method called before class component is mounted, in at begining of class constructor.

### mounted

`mounted()`

Method called after class component is mounted. Children component instances are now available.

### unmounted

`unmounted()`

Method called after class component is unmounted.
The parent component observer will called this unmounted method automatically if the current component is removed from DOM.
All children component instances are also unmounted after this method is called.

## Methods & Properties

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

### add

`add()`

This method allows to 'add', 'create' new Component instance to the tree.
It returns instance(s) and associated properties.

```ts
add<T = Component, P = TProps>(
    classComponent: TAddComponent,
    props?: P,
    returnArray?: boolean,
    attrName?: string
): T;
```

Add component in class core:

```js
bar = this.add(Bar)

// then, access child Bar instance
this.bar.$root
this.bar.unmounted()
// ...
```

`add()` will created as many instances
as there are components found as children.

In case, multi children of the same component is found, `add()` will returned an array of instances.

```html
<div>
  <div data-component="Bar"></div>
  <div data-component="Bar"></div>
</div>
```

```js
bar = this.add(Bar) // will returned array of bar instances
```

If we don't know how many instance of our component `Bar` exist,
it's possible to force `add()` to return an array via `returnArray` parameter.

```js
bar = this.add(Bar, {}, true)
```

With typescript, we can explicitly state that we are expecting an array.

```ts
bar = this.add<Bar[]>(Bar)
```

The method accepts a static props parameter which we can access from the new Bar component via `this.props`.

```js
bar = this.add(Bar, { myProp: "foo" })
```

With typescript, we can type the `props` object:

```ts
bar = this.add<Bar, { myProp: string }>(Bar, { myProp: "foo" }, false)
```

### find

`find()`

This method allows to retrieve B.E.M. element of current $root component.

```js
// if $root is "App", "App_title" DOM element will be returned
$title = this.find("title")
```

With typescript:

```ts
$title = this.find<HTMLElement>("title")
$foo = this.find<HTMLElement[]>("foo")
```

As `add()` method, if a list of element is exist in DOM, `find()` will returns a list of HTMLElement.
It's possible to force an array return via `returnArray` params.

## Stack

In order to get dynamic page fetching and refreshing without reload,
`Stack` extended class is a middleware class between our App root component and `Component` extended class.

Stack is not a router, it only fetch content of specific page and inject it inside a specific container.

`index.html`

```html
<!-- set "data-page-transition-container" attr to the class extened `Stack` -->
<main data-component="App" data-page-transition-container>
  <!-- content who not change between page transitions -->
  <nav>
    <!-- dynamics links need to get URL "data-page-transition-url" -->
    <a href="index.html" data-page-transition-url="index.html">home</a>
    <a href="about.html" data-page-transition-url="about.html">about</a>
  </nav>
  <!-- inside 'data-page-transition-wrapper' content will changed between page transition -->
  <div data-page-transition-wrapper>
    <div data-component="HomePage">...</div>
  </div>
</main>
```

`about.html`

```html
<!-- same page than index.html exept "data-page-transition-wrapper" content -->
<div data-page-transition-wrapper>
  <div data-component="AboutPage">...</div>
</div>
```

`App.js`

```js
class App extends Stack {
  static attrName = "App"

  // list of page components
  addPages() {
    return {
      HomePage,
      AboutPage,
    }
  }
}
```

### pageTransitions

`pageTransitions()`

It's possible to define custom transition senario with `pageTransitions`:

```js
class App extends Stack {
  // ...
  async pageTransitions(currentPage, newPage, complete) {
    // New page is already inject in DOM at this step, we need to manage it manually
    newPage.$pageRoot.style.visibility = "hidden"
    // start play out current page
    await currentPage.playOut()
    // then play in new page
    await newPage.playIn()
    // resolve the page transition promise returned with `complete()` function
    complete()
  }
}
```

### Page playIn & playOut

Each pages can declare it's own page transition `playIn()` & `playOut()`.

`HomePage.js`
(same for AboutPage)

```js
class HomePage extends Component {
  static attrName = "HomePage"

  // Prepare playIn and playOut page transitions used by Stack (example with gsap)
  playIn(comeFrom, resolve) {
    gsap.from(this.$root, { autoAlpha: 0, onComplete: () => resolve() })
  }
  playOut(goTo, resolve) {
    gsap.to(this.$root, { autoAlpha: 0, onComplete: () => resolve() })
  }
}
```

## Options

- `forcePageReload` {boolean} _default: false_
  Force all pages to reload instead of the dynamic new document fetching process.

- `forcePageReloadIfDocumentIsFetching` {boolean} _default: false_
  Force page to reload only if document is fetching.

- `disableLinksDuringTransitions` {boolean} _default: false_
  disable links during transition.

- `disableHistoryDuringTransitions` {boolean} _default: false_
  disable history during transition allow to block transition on popstate event too.

```js
class App extends Stack {
  // ...
  forcePageReloadIfDocumentIsFetching = false
  forcePageReload = false
  disableLinksDuringTransitions = false
  disableHistoryDuringTransitions = false
}
```

## debug

Compose comes with [`@wbe/debug`](https://github.com/willybrauner/debug) tool.
To get some additional logs, add this line on your browser console:

```shell
localStorage.debug = "compose:*"
```

## Credits

© [Willy Brauner](https://willybrauner.com)

## Licence

MIT
