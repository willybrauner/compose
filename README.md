# @wbe/compose

Compose is a tiny zero dependency library for vanilla javascript component approach and page transitions management.

![](https://img.shields.io/npm/v/@wbe/compose/latest.svg)
![](https://img.shields.io/bundlephobia/minzip/@wbe/compose.svg)
![](https://img.shields.io/npm/dt/@wbe/compose.svg)
![](https://img.shields.io/npm/l/@wbe/compose.svg)

## Installation

```shell script
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
import { Component } from "@wbe/compose";
import Header from "Header";

class App extends Component {
  // declare the name value of `data-component` attribute
  static attrName = "App";

  // relay and init "Component" extended class methods
  constructor($root, props) {
    super($root, props);
    this.init();
  }

  // Create new instance for children component list
  components = {
    Header: this.add(Header),
  };

  // target child BEM DOM elements
  elements = {
    // find DOM element with "App_title" class
    $title: this.find("title"),
  };

  // before class component is mounted
  beforeMount() {}

  // after class component is mounted
  mounted() {}

  // after class component is unmounted or the component $root is removed from DOM
  unmounted() {}

  // when children components are updated
  updated() {}
}
```

Then, start component instances chaining by root instance.

```js
const $app = document.querySelector(".App");
new App($app);
```

Each Component like `Header` child class component, need to extends the same `Component` class.

```js
import { Component } from "@wbe/compose";

class Header extends Component {
  static attrName = "Header";

  constructor($root, props) {
    super($root, props);
    this.init();
  }

  mounted() {
    window.addEventListener("resize", this.handleResize);
  }
  unmounted() {
    window.removeEventListener("resize", this.handleResize);
  }
  handleResize = () => {
    // do something on resize...
  };
}
```

## Life cycle

### `beforeMount()`

Method called before class component is mounted.
Current class instance is already available.

### `mounted()`

Method called after class component is mounted.

### `unmounted()`

Method called after class component is unmounted.
The parent component observer will called this unmounted method automatically  
if the current component is removed from DOM.

### `updated()`

Method called when any children component in DOM subtree changed.

## Methods & Properties

### `attrName`

static `string`

`attrName` need to be the name value of `data-component` attribute related to the instance.
This one is used by `Component` extended class, to target current $root element.

example:

If the attribute is declared "Foo" on DOM `<div data-component="Foo" />`, `attrName`
need to be `Foo` too.

```js
class Foo extends Component {
  static attrName = "Foo";
  // ...
}
```

### `add()`

This method allows to 'add', 'create' new Component instance to the tree.
It returns instance(s) and associated properties.

```
add<T = Component, P = TProps>(
    classComponent: TAddComponent,
    props?: P,
    attrName?: string,
    returnArray: boolean = false
): T;
```

```js
components = {
  Bar: this.add(Bar),
};
// then, access child Bar instance
this.Bar.$root;
this.Bar.unmounted();
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
components = {
  Bar: this.add(Bar), // will returned array of Bar instances
};
```

If we don't know how many instance of our component `Bar` exist,
it's possible to force `add()` to return an array via `returnArray` parameter.

```js
components = {
  Bar: this.add(Bar, {}, true),
};
```

With typescript, we can explicitly state that we are expecting an array.

```ts
components = {
  Bar: this.add<Bar[]>(Bar),
};
```

The method accepts a static props parameter which we can access from the new Bar component via `this.props`.

```js
components = {
  Bar: this.add(Bar, { myProp: "foo" }),
};
```

With typescript, we can type the `props` object:

```ts
components = {
  Bar: this.add<Bar, { myProp: string }>(Bar, { myProp: "foo" }, false),
};
```

### `components`

As used on `add()` method, `components` allows to retrieve a list on children component instances create by `add()`.
When current component instance is unmounted, all instances declared in `components` object, will be automatically unmounted.

```ts
components: TComponents = {};

type TComponents = {
  [name: string]: Component | Component[];
};
```

### `find()`

This method allows to retrieve B.E.M. element of current $root component.

```js
elements = {
  // if $root is "App", "App_title" DOM element will be returned
  $title: this.find("title"),
};
// use it...
console.log(elements.$title);
```

With typescript:

```ts
elements = {
  $title: this.find<HTMLElement>("title"),
  $foo: this.find<HTMLElement[]>("foo"),
};
```

As `add()` method, if a list of element is exist in DOM, `find()` will returns a list of HTMLElement.
It's possible to force an array return via `returnArray` params.

### `elements`

this property is a simple list of BEM elements of current component.

## `Stack` extented class

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
  static attrName = "App";

  // list of page components
  pages() {
    return {
      HomePage,
      AboutPage,
    };
  }
}
```

### `pageTransitions()`

It's possible to define custom transition senario with `pageTransitions`:

```js
class App extends Stack {
  // ...

  async pageTransitions(currentPage, newPage, complete) {
    await currentPage.playOut();
    await newPage.playIn();
    complete();
  }
}
```

### Page `playIn()` & `playOut()`

Each pages can have it's own page transition `playIn` & `playOut` too.

`HomePage.js`
(same for AboutPage)

```js
class HomePage extends Component {
  static attrName = "HomePage";
  constructor(...rest) {
    super(...rest);
    this.init();
  }

  // Prepare playIn and playOut page transitions used by Stack
  playIn({ $root, goFrom }) {
    return Promise.resove();
  }
  playOut({ $root, goTo }) {
    return Promise.resove();
  }
}
```

### `defaultPlayIn()` & `defaultPlayOut()`

The component who exented `Stack`, accepts default page transition witch will be used if
no specific methods exist in current page witch is in transition.

```js
class App extends Stack {
  // ...
  defaultPlayIn({ $root, goFrom }) {
    return Promise.resove();
  }
  defaultPlayOut({ $root, goTo }) {
    return Promise.resove();
  }
}
```

### disableTranstitions

For disable page transitions in some case, use `disableTranstitions` property:

```js
class App extends Stack {
  // ...
  disableTransitions = true;
}
```
