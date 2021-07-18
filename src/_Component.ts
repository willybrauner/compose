export type TCreateFn = {
  element?: HTMLElement,
  children?: HTMLElement[],
  onDestroy?: ()=>void
}


let COMPONENTS = [];
let CURRENT_COMPONENTS = [];
let COMPONENT_ID = 0;
let COMPONENT_ATTR = 'data-component';
let ID_ATTR = 'data-component-id';
let noop = () => { };


const componentName = "component";
const debug = require("debug")(`front:${componentName}`);

/**
 * register
 *
 *  pousse le compodant name + fn create dans un tableau
 *
 * @param name
 * @param create
 */
export function register(name:string, create) {
  let l = COMPONENTS.push({ name, create });
  return COMPONENTS[l - 1];
}


/**
 * Mount
 *
 *  Get de tous les children du $root
 *
 *
 * @param $root
 * @param componentsList
 * @param depth
 */
export function mount($root: HTMLElement, componentsList = COMPONENTS, depth = 0) {

  let scopedComponents = [];

  // @ts-ignore
  let children = [...$root.querySelectorAll(`[${COMPONENT_ATTR}]:not([${ID_ATTR}])`)];

  if (children.length === 0) return;
  debug('children',children)

  // pour chaque composant enfant
  for (const child of children) {

    // get name
    const componentName = child.dataset[`component`];

    // get current component register in component array
    let current = componentsList.find((component) => component.name === componentName);

    // if component exist in global registered components
    if (current) {
      // si il a déjà un attr, continue to next iteration
      if (child.hasAttribute(`${ID_ATTR}`)) continue;
      // else, get create fn
      const { create } = current;
      // mount recursivly from child
      const children = mount(child, componentsList, depth + 1);

      debug("children ---------------", children, child)
      // increment id
      let id = COMPONENT_ID++;
      // mount component
      let prepare = prepareComponent(id, componentName, child, create, children);

      // register in global scope
      CURRENT_COMPONENTS[id] = prepare;

      scopedComponents.push(prepare, ...children);
    } else {
      console.warn(`Component ${componentName} found but it doesn't exist.`);
    }
  }

  debug('scopedComponents',scopedComponents)
  return scopedComponents;
}


/**
 * Prepare component
 * @param id
 * @param name
 * @param element
 * @param create
 * @param children
 */
async function prepareComponent(
  id: number,
  name: string,
  element: HTMLElement,
  create: ({ element, children, onDestroy }: TCreateFn) => Promise<any>,
  children: HTMLElement[]
)
{

  element.setAttribute(ID_ATTR, `${id}`);

  let component = {
    _id: id,
    _name: name,
    _children: children,
    _destroy: function() {
      element.removeAttribute(ID_ATTR);
    },
    destroy: function(fn = noop) {
      return () => {
        fn();
        component._destroy();
      }
    },
    getInstance: function() {
      return component["_instance"];
    }
  };

  component["_instance"] = await create({ element, children, onDestroy: component.destroy })

  return component;
}



// ---------------------------------------------------------------------------------------

/**
 * Watch
 * @param element
 */
export function watch(element = document.body) {
   mount(element);

  async function onChange(mutationList) {
    for (let i = 0; i < mutationList.length; i++) {
      let { addedNodes, removedNodes } = mutationList[i];

      for (let i = 0; i < addedNodes.length; i++) {
        await mount(addedNodes[i].parentNode);
      }

      for (let i = 0; i < removedNodes.length; i++) {
        unmount(removedNodes[i]);
      }
    }
  }

  let observer = new MutationObserver(onChange);
  observer.observe(element, { subtree: true, childList: true });

  return () => {
    observer.disconnect();
    observer = null;

    unmount(element);
  };
}


/**
 * Check
 * @param element
 */
function _check(element) {
  let elements = element.querySelectorAll('*');
  let names = COMPONENTS.map(component => component.name);

  let missingComponents = [];

  for (let i = 0; i < elements.length; i++) {
    let attributes = Array.from(elements[i].attributes);

    for (let j = 0; j < attributes.length; j++) {
      let attribute = attributes[j];
      if (attribute["name"].startsWith('data-component')) {
        let name = attribute["name"].split('-').splice(2).join('-');

        if (names.indexOf(name) < 0 && missingComponents.indexOf(name) < 0) {
          missingComponents.push(name);
        }
      }
    }
  }

  for (let i = 0; i < missingComponents.length; i++) {
    console.warn(`Component ${missingComponents[i]} found but it doesn't exist.`);
  }
}



/**
 * Unmount
 * @param element
 */
export function unmount(element) {

  let results = element.querySelectorAll(`[${ID_ATTR}]`);

  let id = parseInt(element.dataset['cId']);
  let current = CURRENT_COMPONENTS[id];

  if (current) {
    current.destroy();
    CURRENT_COMPONENTS[id] = null;
  }

  for (let i = 0; i < results.length; i++) {
    unmount(results[i]);
  }
}




/**
 * unmount
 * @param id
 */
function unmountComponent(id) {

}

export default {
  mount,
  unmount,
  register,
  watch,
  check: _check,
};
