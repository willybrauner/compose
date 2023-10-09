<div align="center">
<h1>Compose</h1>

![](documentation/static/img/logo.png)

![](https://img.shields.io/npm/v/@wbe/compose/latest.svg)
![](https://img.shields.io/bundlephobia/minzip/@wbe/compose.svg)
![](https://img.shields.io/npm/dt/@wbe/compose.svg)
![](https://img.shields.io/npm/l/@wbe/compose.svg)

Compose is a small and type-safe library that links your javascript to your DOM.  
_⚠️ This library is work in progress, the API is subject to change until the v1.0 release._

<br/>
<br/>
</div>

## Installation

```shell
$ npm i @wbe/compose
```

## Components

### add

This method allows to 'add' new Component instance to the tree.
It returns a single instance and associated properties.

Add component inside the class:

```js
class Foo extends Component {
  bar = this.add(Bar)

  customMethod() {
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
  bars = this.addAll(Bar) // return array of Bar: [Bar, Bar]
}
```

## Start examples

- Clone this repo

```shell
$ git clone git@github.com:willybrauner/compose.git
```

- Install dependencies with [pnpm](https://pnpm.io/)

```shell
$ pnpm install
```

- Start example dev server

```shell
$ npm run example-basic:dev
```

## <a name="Credits"></a>Credits

[© Willy Brauner](https://willybrauner.com)

## <a name="Licence"></a>Licence

[MIT](./LICENCE)
