---
sidebar_position: 2
title: page transitions
---

```ts
pageTransitions(currentPage: IPage, newPage: IPage, complete: () => void): Promise<any>;
```

Transition scenario is open by `pageTransitions` function in extended Stack class:

```js
class App extends Stack {
  // ...
  async pageTransitions(currentPage, newPage, complete) {
    // The new page is already injected into DOM at this stage
    // we have to manage it ourselves
    newPage.$pageRoot.style.visibility = "hidden"

    // start play out current page
    await currentPage.playOut()

    // Make new page root visible
    newPage.$pageRoot.style.visibility = "visible"

    // then play in new page
    await newPage.playIn()

    // resolve the page transition promise returned with `complete()` function
    complete()
  }
}
```
