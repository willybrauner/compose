import { gsap } from "gsap"
import debugModule from "debug"
const debug = debugModule(`front:defaultTransitions`)

const xValue = 100
const duration = 1

export const defaultPlayIn = ($root?: HTMLElement, goFrom?: string, resolve?: () => void): void => {
  debug("goFrom:", goFrom)
  gsap.fromTo(
    $root,
    {
      autoAlpha: 0,
      x: xValue,
    },
    {
      x: 0,
      autoAlpha: 1,
      duration,
      ease: "power3.out",
      onComplete: resolve,
    }
  )
}

export const defaultPlayOut = ($root?: HTMLElement, goTo?: string, resolve?: () => void): void => {
  debug("goTo: ", goTo)
  gsap.fromTo(
    $root,
    {
      x: 0,
      autoAlpha: 1,
    },
    {
      autoAlpha: 0,
      x: -xValue,
      duration,
      ease: "power3.out",
      onComplete: resolve,
    }
  )
}
