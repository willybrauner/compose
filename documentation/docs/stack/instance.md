---
sidebar_position: 1
title: instance
---

The second part of compose is about Stack.
In order to get dynamic page fetching and refreshing without reload,
`Stack` extended class is a middleware class between our App root component and `Component` extended class.

:::note
**Stack is not a router**, it only fetch content of specific page and inject it inside a specific container.
But it uses [history](https://github.com/ReactTraining/history) to manage pages switch by clicking a link or with `history.push()` method.
:::

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

`App.js` will extend `Stack` instead of `Component`.

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

Stack constructor need these properties:

- `$root`: App root element (witch takes data-component="App" attribute)
- `history`: History mode can
  be [BROWSER](https://github.com/ReactTraining/history/blob/master/docs/api-reference.md#createbrowserhistory)
  ,
  [HASH](https://github.com/ReactTraining/history/blob/master/docs/api-reference.md#createhashhistory)
  ,
  [MEMORY](https://github.com/ReactTraining/history/blob/master/docs/api-reference.md#creatememoryhistory)
  . For more information, check
  the [history library documentation](https://github.com/ReactTraining/history/blob/master/docs/api-reference.md)
- `props`: Props key/values object.

```ts
{
  $root: HTMLElement
  history: BrowserHistory | HashHistory | MemoryHistory
  props?: Props
}
```

`index.ts`:

```js
import { App } from "./App"
import { createBrowserHistory } from "history"

const app = new App({
  $root: document.querySelector(".App"),
  history: createBrowserHistory(),
  props: { foo: "bar" },
})
```
