# @wbe/compose

Compose is a tiny zero dependency library for vanilla javascript component approach and page transitions management.

> ⚠️ This library is work in progress, the API is subject to change until the v1.0 release.

![](https://img.shields.io/npm/v/@wbe/compose/latest.svg)
![](https://img.shields.io/bundlephobia/minzip/@wbe/compose.svg)
![](https://img.shields.io/npm/dt/@wbe/compose.svg)
![](https://img.shields.io/npm/l/@wbe/compose.svg)

## Summary

- [Installation](#Installation)
- [Component](#Component)
  - [beforeMount](#beforeMount)
  - [mounted](#mounted)
  - [unmounted](#unmounted)
  - [attrName](#attrName)
  - [add](#add)
  - [addAll](#addAll)
  - [find](#find)
  - [findAll](#findAll)
- [Stack](#Stack)
  - [pageTransitions](#pageTransitions)
  - [Page playIn & playOut](#PageplayIn&playOut)
  - [Stack options](#StackOptions)
- [debug](#debug)
- [Credits](#Credits)
- [Licence](#Licence)


## <a name="Installation"></a>Installation

```shell
$ npm i @wbe/compose
```

## <a name="Component"></a>Component

In order to use `Component`:

Set `data-component` name attribute on specific DOM element:

```html
<div data-component="App">
  <h1>Hello</h1>
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


### <a name="beforeMount"></a>beforeMount

`beforeMount()`

Method called before class component is mounted, in at begining of class constructor.

### <a name="mounted"></a>mounted

`mounted()`

Method called after class component is mounted. Children component instances are now available.

### <a name="unmounted"></a>unmounted

`unmounted()`

Method called after class component is unmounted.
The parent component observer will called this unmounted method automatically if the current component is removed from DOM.
All children component instances are also unmounted after this method is called.


### <a name="attrName"></a>attrName

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

### <a name="add"></a>add

```ts
add<C extends Component, P = TProps>(classComponent: new <P = TProps>(...args: any[]) => C, props?: P, attrName?: string): C;
```

This method allows to 'add' new Component instance to the tree.
It returns a single instance and associated properties.


Add component inside the class:

```js
bar = this.add(Bar)

// then, access child Bar instance
this.bar.$root
this.bar.unmounted()
// ...
```

With typescript, we can explicitly state that we are expecting an array.

```ts
bar = this.add<Bar>(Bar)
```

The method accepts a static props parameter which we can access from the new Bar component via `this.props`.

```js
bar = this.add(Bar, { myProp: "foo" })
```

With typescript, we can type the `props` object:

```ts
bar = this.add<Bar, { myProp: string }>(Bar, { myProp: "foo" }, false)
```


### <a name="addAll"></a>addAll

```ts
addAll<C extends Component, P = TProps>(classComponent: new <P = TProps>(...args: any[]) => C, props?: P, attrName?: string): C[];
```

`addAll` will return an array of instances.

```html
<div>
  <div data-component="Bar"></div>
  <div data-component="Bar"></div>
</div>
```

```js
bar = this.addAll(Bar) // [Bar, Bar]
```

With typescript, we can explicitly state that we are expecting an array.

```ts
bar = this.addAll<Bar>(Bar)
```

### <a name="find"></a>find

```ts
find<T extends HTMLElement>(bemElementName: string, className?: string): T;
```

This method allows to retrieve B.E.M. element of current $root component.

```html
<h1 class="Bar_title">Hello</h1>
```

```js
// if $root is "Bar", "Bar_title" DOM element will be returned
$title = this.find("title") // <h1 class="Bar_title">Hello</h1>
```

With typescript:

```ts
$title = this.find<HTMLElement>("title")
```

### <a name="findAll"></a>findAll

```ts
findAll<T extends HTMLElement[]>(bemElementName: string, className?: string): T;
```

`finAll` returns a DOM Element array. 


```html
<div class="Bar_icon">icon</div>
<div class="Bar_icon">icon</div>
```
```js
$title = this.findAll("icon") // [div.Bar_icon, div.Bar_icon] 
```

With typescript:

```ts
$title = this.find<HTMLElement>("title")
```


## <a name="Stack"></a>Stack

In order to get dynamic page fetching and refreshing without reload,
`Stack` extended class is a middleware class between our App root component and `Component` extended class.

Stack is not a router, it only fetch content of specific page and inject it inside a specific container.

`index.html`

```html
<!-- set "data-page-transition-container" attr to the class extended `Stack` -->
<main data-component="App" data-page-transition-container>
  <!-- content who not change between page transitions -->
  <nav>
    <!-- dynamics links need to get URL "data-page-transition-url" -->
    <a href="index.html" data-page-transition-url="index.html">home</a>
    <a href="about.html" data-page-transition-url="about.html">about</a>
  </nav>
  <!-- inside 'data-page-transition-wrapper' content will be changed between page transition -->
  <div data-page-transition-wrapper>
    <div data-component="HomePage">...</div>
  </div>
</main>
```

`about.html`

```html
<!-- same page than index.html except "data-page-transition-wrapper" content -->
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

### <a name="pageTransitions"></a>pageTransitions

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

### <a name="PageplayIn&playOut"></a>Page playIn & playOut

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

### <a name="StackOptions"></a>Stack options

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

## <a name="debug"></a>debug

Compose comes with [`@wbe/debug`](https://github.com/willybrauner/debug) tool.
To get some additional logs, add this line on your browser console:

```shell
localStorage.debug = "compose:*"
```

## <a name="Credits"></a>Credits

© [Willy Brauner](https://willybrauner.com)

## <a name="Licence"></a>Licence

MIT
