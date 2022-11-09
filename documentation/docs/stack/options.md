---
sidebar_position: 3
title: options
---

- `forcePageReload` {boolean} _default: false_
  Force all pages to reload instead of the dynamic new document fetching process.

- `forcePageReloadIfDocumentIsFetching` {boolean} _default: false_
  Force page to reload only if document is fetching.

- `disableLinksDuringTransitions` {boolean} _default: false_
  disable links during transition.

- `disableHistoryDuringTransitions` {boolean} _default: false_
  disable history during transition allow blocking transition on popstate event too.

```js
class App extends Stack {
  // ...
  forcePageReloadIfDocumentIsFetching = false
  forcePageReload = false
  disableLinksDuringTransitions = false
  disableHistoryDuringTransitions = false
}
```
