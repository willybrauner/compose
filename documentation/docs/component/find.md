---
sidebar_position: 4
title: find element
---

## `find`

`find` is a simple `this.$root.querySelector` wrapper.  
This method allows retrieving `BEM` element of current $root component.

```html
<div class="Bar" data-component="Bar">
  <h1 class="Bar_title">Hello</h1>
</div>
```

```js
class Bar extends Component {
  // <h1 class="Bar_title">Hello</h1>
  $title = this.find("title")
}
```

With typescript:

```ts
class Bar extends Component {
  $title = this.find<HTMLElement>("title")
}
```

### Definition

```ts
find<T extends HTMLElement>(bemElementName: string, className?: string): T;
```

## `findAll`

`findAll` is a simple `this.$root.querySelectorAll` wrapper.  
This method returns a DOM Element array.

```html
<div class="Bar" data-component="Bar">
  <div class="Bar_icon">icon</div>
  <div class="Bar_icon">icon</div>
</div>
```

```js
class Bar extends Component {
  // [div.Bar_icon, div.Bar_icon]
  $icons = this.findAll("icon")
}
```

With typescript:

```ts
class Bar extends Component {
  $icons = this.findAll<HTMLElement[]>("icon")
}
```

### Definition

```ts
findAll<T extends HTMLElement[]>(bemElementName: string, className?: string): T;
```
