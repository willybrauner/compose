---
sidebar_position: 2
title: play in-out
---

For `Stack.pageTransitions()` each page need to define his own `playIn()` & `playOut()` transitions.
`Component` expose prepared methods to make it possible:

```ts
playIn(comeFrom: string, resolve: () => void): void;
playOut(goTo: string, resolve: () => void): void;
```

`HomePage.js`
(same for AboutPage)

We prepare playIn and playOut page transitions used by Stack (example with gsap)

```js
class HomePage extends Component {
  static attrName = "HomePage"

  playIn(comeFrom, resolve) {
    gsap.from(this.$root, {
      autoAlpha: 0,
      onComplete: () => resolve(),
    })
  }

  playOut(goTo, resolve) {
    gsap.to(this.$root, {
      autoAlpha: 0,
      onComplete: () => resolve(),
    })
  }
}
```
