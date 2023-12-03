# @wbe/compose

## 0.16.0

### Minor Changes

- 665cc19: # new API

  ## Remove Stack

  Compose is only component managment, not "routing" & page transitions anymore.

  ## Rewrite example

  Add example with a "Stack like" managed with `@wbe/low-router` & `@wbe/interpol`

  ## Changes in Component

  - `$root` become `root`
  - `Component` constructor has changed:

  ```ts
    constructor(root: HTMLElement, options: Partial<ComponentOptions<P>> = {})

    interface ComponentOptions<P> {
    name: string
    props: P
  }
  ```

  - `static attrName` is rename `public readonly name`. Name is now ` options.name ?? this.root?.classList?.[0]`
  - `find()` can accept "\_element"
  - `mounted` can return a function called when component is unmounted.

  ## Stack

  - Stack component as been removed because his role remains out of subject of this repo. An example still available in `examples/basic`.

  ## Manage repo

  - move to mono-repo
  - build with tsup
