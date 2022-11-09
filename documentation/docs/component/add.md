---
sidebar_position: 3
title: add component
---


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
bar = this.add<Bar, { myProp: string }>(Bar, { myProp: "foo" }, "customAttribute")
```

### <a name="addAll"></a>addAll

```ts
addAll<C extends Component[], P = TProps>(
    classComponent: new <P = TProps>(...args: any[]) => GetElementType<C>,
    props?: P,
    attrName?: string
  )
```

`addAll` will return an array of instances.

```html
<div>
  <div data-component="Bar"></div>
  <div data-component="Bar"></div>
</div>
```

```js
bars = this.addAll(Bar) // [Bar, Bar]
```

With typescript, we can explicitly state that we are expecting an array.

```ts
bars = this.addAll<Bar[]>(Bar)
```
