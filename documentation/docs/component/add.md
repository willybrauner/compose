---
sidebar_position: 3
title: add component
description: Create a child Component instance
---

## `add`

This method allows to 'add' new Component instance to the tree.
It returns a single instance and associated properties.

Add component inside the class:

```js
class Foo extends Component {
  bar = this.add(Bar)

  customMethod() {
    // then, access child Bar instance
    this.bar.$root
    this.bar.mounted()
    this.bar.unmounted()
    // etc...
  }
}
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
bar = this.add<Bar, { myProp: string }>(Bar, { myProp: "foo" }, "customAttribute")
```

## `addAll`

`addAll` will return an array of instances.

```html
<div>
  <div data-component="Bar"></div>
  <div data-component="Bar"></div>
</div>
```

```js
class Foo extends Component {
  bars = this.addAll(Bar) // return array of Bar: [Bar, Bar]
}
```

With typescript, we can explicitly state that we are expecting an array.

```ts
class Foo extends Component {
  bars = this.addAll<Bar[]>(Bar)
}
```
