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
  Disable history during transition allow blocking transition on popstate event too.

- `keepPageNumberDuringTransitions`{number} _default: 1_
  Page number to keep in container if need request is made during the transition. Be careful, more than 1 can cause serious UI bugs.

- `enableCache` {boolean} _default: true_
  Enable page cache. It keeps DOM HTML and JS class instance of each pages visited.

```js
class App extends Stack {
  // ...
  forcePageReloadIfDocumentIsFetching = false
  forcePageReload = false
  disableLinksDuringTransitions = false
  disableHistoryDuringTransitions = false
  keepPageNumberDuringTransitions = 1
  enableCache = true
}
```
