"use client"

import { Children, useLayoutEffect, useRef, type ReactNode } from "react"
import gsap from "gsap"

interface FullPageSliderProps {
  children: ReactNode
  onIndexChange?: (index: number) => void
  className?: string
}

/**
 * Scroll-jacked full-viewport slider. Every wheel tick, touch swipe, or arrow
 * key press commits to exactly one full slide transition — there is no
 * partial / hover state between slides. While a transition is animating,
 * further input is ignored (and a short cooldown afterward absorbs
 * trackpad/touch momentum), so a single small scroll always resolves to a
 * complete, locked page change.
 */
export function FullPageSlider({ children, onIndexChange, className = "" }: FullPageSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const indexRef = useRef(0)
  const animatingRef = useRef(false)
  const touchStartY = useRef<number | null>(null)
  const slideCount = Children.count(children)

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return

    const html = document.documentElement
    const previousHtmlOverflow = html.style.overflow
    const previousBodyOverflow = document.body.style.overflow
    html.style.overflow = "hidden"
    document.body.style.overflow = "hidden"

    const getSlideHeight = () => track.children[0]?.getBoundingClientRect().height ?? window.innerHeight

    const goTo = (next: number) => {
      const clamped = Math.max(0, Math.min(slideCount - 1, next))
      if (clamped === indexRef.current || animatingRef.current) return
      animatingRef.current = true
      indexRef.current = clamped
      onIndexChange?.(clamped)
      gsap.to(track, {
        y: -clamped * getSlideHeight(),
        duration: 0.65,
        ease: "power2.inOut",
        onComplete: () => {
          window.setTimeout(() => {
            animatingRef.current = false
          }, 150)
        },
      })
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      if (animatingRef.current || Math.abs(event.deltaY) < 4) return
      goTo(indexRef.current + (event.deltaY > 0 ? 1 : -1))
    }

    const onTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches[0]?.clientY ?? null
    }

    const onTouchMove = (event: TouchEvent) => {
      event.preventDefault()
    }

    const onTouchEnd = (event: TouchEvent) => {
      if (touchStartY.current === null || animatingRef.current) return
      const endY = event.changedTouches[0]?.clientY ?? touchStartY.current
      const delta = touchStartY.current - endY
      touchStartY.current = null
      if (Math.abs(delta) > 40) {
        goTo(indexRef.current + (delta > 0 ? 1 : -1))
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (animatingRef.current) return
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault()
        goTo(indexRef.current + 1)
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault()
        goTo(indexRef.current - 1)
      }
    }

    onIndexChange?.(0)

    window.addEventListener("wheel", onWheel, { passive: false })
    window.addEventListener("touchstart", onTouchStart, { passive: true })
    window.addEventListener("touchmove", onTouchMove, { passive: false })
    window.addEventListener("touchend", onTouchEnd, { passive: true })
    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("wheel", onWheel)
      window.removeEventListener("touchstart", onTouchStart)
      window.removeEventListener("touchmove", onTouchMove)
      window.removeEventListener("touchend", onTouchEnd)
      window.removeEventListener("keydown", onKeyDown)
      html.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
    }
  }, [slideCount, onIndexChange])

  return (
    <div
      className={`fixed inset-0 h-[100dvh] w-full overflow-hidden ${className}`}
      role="region"
      aria-label="Landing showcase"
    >
      <div ref={trackRef} className="h-full w-full will-change-transform">
        {Children.map(children, (child, i) => (
          <div key={i} className="h-[100dvh] w-full">
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
