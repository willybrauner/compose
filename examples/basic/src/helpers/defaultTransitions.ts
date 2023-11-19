import { Interpol } from "@wbe/interpol"

export const defaultTransitions = (el: HTMLElement) => {
  const paused = true
  const duration = 700
  return {
    playIn: () => {
      const itp = new Interpol({
        paused,
        el,
        duration,
        ease: "power3.out",
        props: {
          x: [-100, 0, "px"],
          opacity: [0, 1],
        },
      })
      return itp.play()
    },
    playOut: () => {
      const itp = new Interpol({
        el,
        duration,
        paused,
        ease: "power3.out",
        props: {
          x: [0, 100, "px"],
          opacity: [1, 0],
        },
      })
      return itp.play()
    },
  }
}
