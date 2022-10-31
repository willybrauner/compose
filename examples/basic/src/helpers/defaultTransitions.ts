import { gsap } from "gsap"
import debug from "@wbe/debug"
const log = debug(`front:defaultTransitions`)

const xValue = 100
const duration = 1

export const defaultPlayIn = (
  $root?: HTMLElement,
  comeFrom?: string,
  resolve?: () => void
): void => {
  // log("comeFrom:", comeFrom)
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
      ease: "power3.inOut",
      onComplete: resolve,
    }
  )
}

export const defaultPlayOut = (
  $root?: HTMLElement,
  goTo?: string,
  resolve?: () => void
): void => {
  // log("goTo: ", goTo)
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
      ease: "power3.inOut",
      onComplete: resolve,
    }
  )
}
