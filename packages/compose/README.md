<div align="center">
<h1>Compose</h1>

![](documentation/static/img/logo.png)

![](https://img.shields.io/npm/v/@wbe/compose/latest.svg)
![](https://img.shields.io/bundlephobia/minzip/@wbe/compose.svg)
![](https://img.shields.io/npm/dt/@wbe/compose.svg)
![](https://img.shields.io/npm/l/@wbe/compose.svg)

Compose is a small library that help to links your javascript to your DOM.  
_⚠️ This library is work in progress, the API is subject to change until the v1.0 release._

<br/>
<br/>
</div>

## Summary

- [Installation](#Installation)
- [Component](#Component)
  - [add](#add)
  - [addAll](#addAll)
  - [find](#find)
  - [findAll](#findAll)
- [lifecycle](#lifecycle)
  - [beforeMount](#beforeMount)
  - [mounted](#mounted)
  - [unmounted](#unmounted)
- [workflow](#Workflow)
- [Credits](#Credits)
- [Licence](#Licence)

## Installation

```shell
$ npm i @wbe/compose
```

## Component

### add

This method allows to 'add' new Component instance to the tree.
It returns a single instance and associated properties.

Add component inside the class:

```js
class Foo extends Component {
  bar = this.add(Bar)

  method() {
    // then, access child Bar instance
    this.bar.root
    this.bar.mounted()
    this.bar.unmounted()
    // etc...
  }
}
```

The method accepts a static props parameter which we can access from the new Bar component via `this.props`.

```js
bar = this.add(Bar, { props: { foo: "bar" } })
```

### addAll

`addAll` will return an array of instances.

```html
<div>
  <div class="Bar"></div>
  <div class="Bar"></div>
</div>
```

```js
class Foo extends Component {
  bars = this.addAll(Bar)
  // Returns array of Bar: [Bar, Bar]
}
```

### `find`

`find` is a simple `this.root.querySelector()` wrapper.  
This method allows retrieving `BEM` element of current $root component.

```html
<div class="Bar">
  <h1 class="Bar_title">Hello</h1>
</div>
```

```js
class Bar extends Component {
  // <h1 class="Bar_title">Hello</h1> can be query with:
  $title = this.find("_title")
  // or
  $title = this.find("Bar_title")
}
```

### `findAll`

`findAll` is a simple `this.$root.querySelectorAll()` wrapper.  
This method returns a DOM Element array.

```html
<div class="Bar">
  <div class="Bar_icon">icon</div>
  <div class="Bar_icon">icon</div>
</div>
```

```js
class Bar extends Component {
  $icons = this.findAll("_icon")
  // [div.Bar_icon, div.Bar_icon]
}
```

## lifecycle

### beforeMount

Each class extended by `Component` provide a life-cycle methods collection.
It's particularly useful when `Stack` class is used.

`beforeMount(): void`

Method called before class component is mounted, in at begining of class constructor.

### mounted

`mounted(): (()=> void) | void`

Method called after class component is mounted. Children component instances are now available.
It can return a function to be called when the component is unmounted.

### unmounted

`unmounted(): void`

Method called after class component is unmounted.
The parent component observer will called this unmounted method automatically if the current component is removed from DOM.
All children component instances are also unmounted after this method is called.

## Workflow

- Clone this repo

```shell
# install dependencies
pnpm i

# build and watch lib changes
pnpm run build:watch

# start tests and watch
pnpm run test:watch

# start dev server for all examples
pnpm run dev

# Or run a specific example
pnpm run dev --scope {example-name}
```

## Credits

[© Willy Brauner](https://willybrauner.com)

## Licence

[MIT](./LICENCE)
