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
    // New page is already inject in DOM at this step, we need to manage it by your own
    newPage.$pageRoot.style.visibility = "hidden"
    // start play out current page
    await currentPage.playOut()
    // then play in new page
    await newPage.playIn()
    // resolve the page transition promise returned with `complete()` function
    complete()
  }
}
```
