/**
 * Composable for scroll-triggered reveal animations using CSS.
 * Elements are visible by default. Animation is purely additive.
 *
 * Usage:
 *   const sectionRef = ref<HTMLElement>()
 *   useScrollReveal(sectionRef, ['.section-header', '.feature-card'])
 */
export function useScrollReveal(
  container: Ref<HTMLElement | undefined>,
  selectors: string | string[],
  options?: {
    staggerMs?: number
    threshold?: number
  }
) {
  const {
    staggerMs = 80,
    threshold = 0.15
  } = options ?? {}

  const selectorList = Array.isArray(selectors) ? selectors : [selectors]

  onMounted(() => {
    if (!import.meta.client || !container.value) return

    const allEls: HTMLElement[] = []
    selectorList.forEach((sel) => {
      container.value!.querySelectorAll<HTMLElement>(sel).forEach((el) => {
        allEls.push(el)
      })
    })
    if (!allEls.length) return

    const reveal = () => {
      allEls.forEach((el, i) => {
        el.style.animation = `reveal-up 0.5s ease ${i * staggerMs}ms both`
      })
    }

    // If already in viewport (above the fold), reveal immediately
    const rect = container.value!.getBoundingClientRect()
    if (rect.top < window.innerHeight) {
      reveal()
      return
    }

    // Otherwise, observe for scroll
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          reveal()
          observer.disconnect()
        }
      },
      { threshold }
    )
    observer.observe(container.value!)
  })
}
