import { useState, useEffect, useRef, useCallback, RefObject } from 'react'

/**
 * Track scroll progress for a section.
 * Returns a 0-1 value indicating how far through the viewport the element is.
 */
export function useScrollProgress(ref: RefObject<HTMLElement | null>): number {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const windowH = window.innerHeight
      // 0 = element just entering viewport from bottom, 1 = fully passed
      const p = 1 - (rect.top / windowH)
      setProgress(Math.max(0, Math.min(1, p)))
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [ref])

  return progress
}

/**
 * Mouse-tracked 3D tilt on a card.
 * Returns ref to attach and style object with transform.
 */
export function useTilt(maxDeg: number = 12) {
  const ref = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<React.CSSProperties>({
    transform: 'perspective(800px) rotateX(0deg) rotateY(0deg)',
    transition: 'transform 0.15s ease-out',
  })

  const handleMove = useCallback((e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateY = ((x - centerX) / centerX) * maxDeg
    const rotateX = -((y - centerY) / centerY) * maxDeg

    setStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      transition: 'transform 0.1s ease-out',
    })
  }, [maxDeg])

  const handleLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(800px) rotateX(0deg) rotateY(0deg)',
      transition: 'transform 0.4s ease-out',
    })
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.addEventListener('mousemove', handleMove)
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [handleMove, handleLeave])

  return { ref, style }
}

/**
 * IntersectionObserver-based scroll reveal.
 * Returns ref and whether element is visible.
 */
export function useScrollReveal(threshold: number = 0.15): [RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, visible]
}

/**
 * Animated counter that counts up when visible.
 */
export function useCounter(target: number, duration: number = 1200): [RefObject<HTMLDivElement>, number] {
  const ref = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>
  const [value, setValue] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          observer.unobserve(el)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return

    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const p = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(eased * target))
      if (p < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [started, target, duration])

  return [ref, value]
}
