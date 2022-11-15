---
sidebar_position: 5
title: API
---

## Component

```ts
new Component($root?: HTMLElement, props?: Props, attrName?: string)
```

### constructor

- **$root** `HTMLElement` - Root element of the DOM component
- **props** `Props {[x:string]: any}` _optional_ - Static property object
- **attrName** `string` _optional_ - Attribute name set on root DOM element. Not a mandatory it `static attrName` is set in class instance.

### add `:Component`

```ts
add<C extends Component, P = TProps>(
  classComponent: new <P = TProps>(...args: any[]) => C,
  props?: P,
  attrName?: string
): C;
```

- **classComponent** `new <P = TProps>(...args: any[])` - Child class that extend `Component` class.
- **props** `Props {[x:string]: any}` _optional_ - Static property object
- **attrName** `string` _optional_ - Attribute name set on root DOM element. Not a mandatory it `static attrName` is set in class instance.

Return `Component` instance

### addAll `:Component[]`

```ts
addAll<C extends Component[], P = TProps>(
    classComponent: new <P = TProps>(...args: any[]) => GetElementType<C>,
    props?: P,
    attrName?: string
  )
```

- **classComponent** `new <P = TProps>(...args: any[])` - Child class that extend `Component` class.
- **props** `Props {[x:string]: any}` _optional_ - Static property object
- **attrName** `string` _optional_ - Attribute name set on root DOM element. Not a mandatory it `static attrName` is set in class instance.

Return `Component` array instance

### find `:HTMLElement`

```ts
find<T extends HTMLElement>(bemElementName: string, className?: string): T;
```

- **bemElementName** `string` - BEM element name
- **className** `string` _optional_ - overwrite default root className.

Return a HTML Element

### findAll `:HTMLElement[]`

```ts
findAll<T extends HTMLElement[]>(bemElementName: string, className?: string): T;
```

- **bemElementName** `string` - BEM element name
- **className** `string` _optional_ - overwrite default root className.

Return a HTML Element array

### beforeMount `:void`

Returns nothing

### mounted `:void`

Returns nothing

### unmounted `:void`

Returns nothing

### playIn `:void`

To use only if the component class is a "page component" add in `Stack.getPages()`

```ts
playIn(comeFrom: string, resolve: () => void): void;
```

- **comeFrom** `string` - Class component name we come from.
- **resolve** `() => void` - resolve function to call when stack component page playIn est complete.

### playOut `:void`

To use only if the component class is a "page component" add in `Stack.getPages()`

```ts
playOut(goTo: string, resolve: () => void): void;
```

- **comeFrom** `string` - Class component name where we go.
- **resolve** `() => void` - resolve function to call when stack component page playIn est complete.

## Stack

### constructor

```ts
 constructor({ $root, history, props }: {
        $root: HTMLElement;
        props: GProps;
        history: BrowserHistory | HashHistory | MemoryHistory;
    });
```

- **$root** `HTMLElement` - Root element of the DOM component.
- **props** `Props {[x:string]: any}` _optional_ - Static property object.
- **history** `BrowserHistory | HashHistory | MemoryHistory` - History mode to use.

