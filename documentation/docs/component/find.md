---
sidebar_position: 4
title: find element
---



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
$icons = this.findAll("icon") // [div.Bar_icon, div.Bar_icon]
```

With typescript:

```ts
$icons = this.findAll<HTMLElement[]>("icon")
```
