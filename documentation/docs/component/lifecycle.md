---
sidebar_position: 2
title: life cycle
---

### <a name="beforeMount"></a>beforeMount

Each class extended by `Component` provide a life-cycle methods collection.
It's particularly useful when `Stack` class is used.

`beforeMount()`

Method called before class component is mounted, in at begining of class constructor.

### <a name="mounted"></a>mounted

`mounted()`

Method called after class component is mounted. Children component instances are now available.

### <a name="unmounted"></a>unmounted

`unmounted()`

Method called after class component is unmounted.
The parent component observer will called this unmounted method automatically if the current component is removed from DOM.
All children component instances are also unmounted after this method is called.
