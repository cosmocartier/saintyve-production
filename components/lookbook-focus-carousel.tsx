"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, useMotionValue, animate, useReducedMotion, AnimatePresence } from "framer-motion"

// ---------------------------------------------------------------------------
// Data
// Replace the `image` values with real Saint Yve look photography later.
// `label` names the style direction each look represents; it's what the
// caption below the carousel crossfades between as the focus changes.
// ---------------------------------------------------------------------------

interface Look {
  id: number
  image: string
  alt: string
  label: string
}

const LOOKS: Look[] = [
  {
    id: 1,
    image: "https://imagedelivery.net/JEnxpBxUTK5Xr6qf5ykeBg/4c61ff24-eed7-44ce-d7c9-4b5283d6b200/w=800",
    alt: "Saint Yve look 1",
    label: "Streetwear",
  },
  { id: 2, image: "/images/lookbook/look-2.png", alt: "Saint Yve look 2", label: "Off-Duty" },
  { id: 3, image: "/images/lookbook/look-3.png", alt: "Saint Yve look 3", label: "Loungewear" },
  { id: 4, image: "/images/lookbook/look-4.png", alt: "Saint Yve look 4", label: "Tailored" },
  { id: 5, image: "/images/lookbook/look-5.png", alt: "Saint Yve look 5", label: "Casual Knit" },
  { id: 6, image: "/images/lookbook/look-6.png", alt: "Saint Yve look 6", label: "Outerwear" },
]

// How many frames to render on each side of the focused center. This is the
// virtualized "window" into the endless, recycled sequence. With only 6
// source images, going out to ±3 would make the two farthest edges show the
// exact same photo (since +3 and -3 are congruent mod 6) — an obvious tell
// that the sequence is finite. Capping at ±2 keeps every visible frame
// unique no matter how few source images there are (as long as count >= 5).
const MAX_OFFSET = 2
const OFFSETS = Array.from({ length: MAX_OFFSET * 2 + 1 }, (_, i) => i - MAX_OFFSET)

// Once the continuous position drifts this far from zero, silently rebase it
// by a whole multiple of `count`. Because the shift is always an exact
// multiple of the sequence length, every frame's modulo image index and its
// distance-from-center stay bit-for-bit identical — the user can never
// perceive the rebase. This is what makes dragging feel truly infinite
// instead of hitting float-precision or array-bounds limits.
const REBASE_THRESHOLD = 500

function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

// ---------------------------------------------------------------------------
// Depth interpolation
// Given a signed distance from the focused (fractional) position, return the
// visual properties for that frame. Values are continuously interpolated so
// dragging never "snaps" between discrete states. Mobile gets a steeper
// falloff so the center image reads as clearly dominant in a narrow viewport.
// ---------------------------------------------------------------------------

function getDepthStyle(distance: number, isMobile: boolean) {
  const abs = Math.min(Math.abs(distance), 3)

  const scale = isMobile ? 1 - abs * 0.17 : 1 - abs * 0.15
  const opacityFloor = isMobile ? 0.03 : 0.1
  const opacityFalloff = isMobile ? 0.42 : 0.3
  const opacity = Math.max(1 - abs * opacityFalloff, opacityFloor)
  const blur = abs > 1 ? Math.min((abs - 1) * 2.5, 3) : 0
  const zIndex = 100 - Math.round(abs * 10)

  return {
    scale: Math.max(scale, isMobile ? 0.45 : 0.5),
    opacity,
    blur,
    zIndex,
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function LookbookFocusCarousel() {
  const count = LOOKS.length
  const containerRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const router = useRouter()

  // Continuous, UNBOUNDED logical position. There is no minimum or maximum —
  // that absence of clamping is precisely what makes the carousel infinite.
  // e.g. -4.35 means "35% of the way from logical slot -5 to slot -4", and
  // slot -5 maps to LOOKS[mod(-5, count)].
  const [position, setPosition] = useState(0)
  const positionMV = useMotionValue(0)
  const dragStartX = useRef(0)
  const dragStartPosition = useRef(0)
  const lastMoveX = useRef(0)
  const lastMoveTime = useRef(0)
  const velocityPxMs = useRef(0)
  // Browsers fire a synthetic "click" on whatever element is under the
  // pointer right after pointerup — even after a long drag. We use this ref
  // (rather than the `isDragging` state, which flips before that click
  // fires) to swallow that phantom click so it can never snap the carousel
  // back to wherever the pointer happened to land.
  const dragMovedRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)
  const [frameGap, setFrameGap] = useState(230)
  const [frameWidth, setFrameWidth] = useState(230)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const updateBreakpoint = () => {
      const w = window.innerWidth
      if (w < 640) {
        // Mobile: the center card stays comfortably smaller than the
        // viewport so both neighbors clearly peek in on either side —
        // matching the desktop "fan" composition instead of filling the
        // whole frame with just the center image.
        const width = Math.round(w * 0.46)
        setFrameWidth(width)
        setFrameGap(Math.round(w * 0.5))
        setIsMobile(true)
      } else if (w < 1024) {
        setFrameWidth(190)
        setFrameGap(200)
        setIsMobile(false)
      } else {
        setFrameWidth(Math.min(260, Math.max(150, Math.round(w * 0.2))))
        setFrameGap(230)
        setIsMobile(false)
      }
    }
    updateBreakpoint()
    window.addEventListener("resize", updateBreakpoint)
    return () => window.removeEventListener("resize", updateBreakpoint)
  }, [])

  const rebase = useCallback(
    (value: number) => {
      if (Math.abs(value) < REBASE_THRESHOLD) return value
      const shift = Math.round(value / count) * count
      return value - shift
    },
    [count],
  )

  const settleTo = useCallback(
    (target: number) => {
      const rounded = Math.round(target)
      animate(positionMV, rounded, {
        type: "spring",
        stiffness: 260,
        damping: 32,
        mass: 0.9,
        onUpdate: (v) => setPosition(v),
        onComplete: () => {
          const safe = rebase(rounded)
          if (safe !== rounded) {
            positionMV.set(safe)
            setPosition(safe)
          }
        },
      })
    },
    [positionMV, rebase],
  )

  // Drag state lives in refs (not just React state) so the window-level
  // listeners below always read the latest values without needing to be
  // re-attached on every render.
  const frameGapRef = useRef(frameGap)
  frameGapRef.current = frameGap
  const positionRef = useRef(position)
  positionRef.current = position

  // Real mobile browsers (particularly iOS Safari) can be unreliable about
  // continuing to dispatch pointermove/pointerup to the *original* element
  // once a finger drags off it — even with setPointerCapture, which Safari
  // has historically supported inconsistently for non-form-control targets.
  // Attaching move/up listeners on `window` for the duration of the drag is
  // the bulletproof pattern: once a drag starts, every subsequent pointer
  // event is caught no matter where the finger travels or which element
  // ends up under it.
  useEffect(() => {
    if (!isDragging) return

    const onMove = (e: PointerEvent) => {
      const deltaX = e.clientX - dragStartX.current
      if (Math.abs(deltaX) > 4) dragMovedRef.current = true
      const deltaPosition = -deltaX / frameGapRef.current
      const raw = dragStartPosition.current + deltaPosition
      setPosition(raw)
      positionMV.set(raw)

      const dt = e.timeStamp - lastMoveTime.current
      if (dt > 0) {
        velocityPxMs.current = (e.clientX - lastMoveX.current) / dt
      }
      lastMoveX.current = e.clientX
      lastMoveTime.current = e.timeStamp
    }

    const onUp = () => {
      setIsDragging(false)
      // Project a little further in the direction of the release velocity
      // so a fast flick can carry past one frame, then settle with a
      // spring — the "premium iOS-style" momentum feel.
      const projectedDeltaPosition = -(velocityPxMs.current * 90) / frameGapRef.current
      const clampedProjection = Math.max(-2.5, Math.min(2.5, projectedDeltaPosition))
      settleTo(positionRef.current + clampedProjection)
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerup", onUp, { passive: true })
    window.addEventListener("pointercancel", onUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
    }
  }, [isDragging, positionMV, settleTo])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Stop iOS Safari's default touch behaviors (callout menu, text
      // selection, double-tap-to-zoom recognition delay) from ever getting
      // a chance to compete with the drag.
      e.preventDefault()
      setIsDragging(true)
      dragMovedRef.current = false
      dragStartX.current = e.clientX
      dragStartPosition.current = position
      lastMoveX.current = e.clientX
      lastMoveTime.current = e.timeStamp
      velocityPxMs.current = 0
      positionMV.stop()
    },
    [position, positionMV],
  )

  const goTo = useCallback(
    (logicalIndex: number) => {
      settleTo(logicalIndex)
    },
    [settleTo],
  )

  const goRelative = useCallback(
    (delta: number) => {
      settleTo(Math.round(position) + delta)
    },
    [position, settleTo],
  )

  // Mobile only: automatically advance to the next look every ~2.5s instead
  // of requiring a manual drag/tap. Paused while the user is actively
  // dragging so an auto-advance can never fight a manual gesture, and
  // disabled entirely when reduced motion is preferred. Desktop keeps its
  // existing manual-only drag interaction unchanged.
  useEffect(() => {
    if (!isMobile || isDragging || prefersReducedMotion) return
    const interval = setInterval(() => {
      goRelative(1)
    }, 2500)
    return () => clearInterval(interval)
  }, [isMobile, isDragging, prefersReducedMotion, goRelative])

  const centerRound = Math.round(position)
  const activeImageIndex = mod(centerRound, count)

  // Respect reduced-motion: skip the drag-physics interaction and just show
  // a clean centered look with simple, non-animated index switching.
  if (prefersReducedMotion) {
    return (
      <section className="relative w-full bg-white py-20 lg:py-28 overflow-hidden" aria-roledescription="carousel">
        <SectionHeading />
        <div className="flex items-center justify-center px-6">
          <div className="w-[240px] h-[620px] overflow-hidden bg-zinc-50">
            <img
              src={LOOKS[activeImageIndex].image || "/placeholder.svg"}
              alt={LOOKS[activeImageIndex].alt}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <LookCaption label={LOOKS[activeImageIndex].label} index={activeImageIndex} count={count} />
      </section>
    )
  }

  return (
    <section
      className="relative w-full bg-white py-20 lg:py-28 overflow-hidden"
      aria-roledescription="carousel"
      aria-label="Saint Yve look gallery"
    >
      <SectionHeading />

      <div
        ref={containerRef}
        role="group"
        tabIndex={0}
        aria-label={`Look ${activeImageIndex + 1} of ${count}, ${LOOKS[activeImageIndex].alt}`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault()
            goRelative(1)
          } else if (e.key === "ArrowLeft") {
            e.preventDefault()
            goRelative(-1)
          }
        }}
        onPointerDown={handlePointerDown}
        className="relative w-full flex items-center justify-center select-none outline-none"
        style={{
          height: isMobile ? "74vh" : "min(70vh, 680px)",
          cursor: isDragging ? "grabbing" : "grab",
          // Hand the whole gesture to our pointer handlers on every device.
          // `pan-y` alone can still let mobile Safari/Chrome intercept the
          // first touch move as a page-scroll gesture before JS reacts,
          // which is what made dragging feel dead on mobile. `none` fully
          // opts the element out of native touch scrolling/zooming so drag
          // math runs identically for mouse and touch.
          touchAction: "none",
          WebkitTapHighlightColor: "transparent",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
        }}
      >
        {OFFSETS.map((offset) => {
          const logicalIndex = centerRound + offset
          const distance = logicalIndex - position
          const imgIndex = mod(logicalIndex, count)
          const look = LOOKS[imgIndex]
          const { scale, opacity, blur, zIndex } = getDepthStyle(distance, isMobile)
          const x = distance * frameGap

          return (
            <motion.button
              key={logicalIndex}
              type="button"
              aria-label={`Show ${look.alt}`}
              aria-current={logicalIndex === centerRound}
              tabIndex={-1}
              onClick={() => {
                if (dragMovedRef.current) return
                if (look.label === "Streetwear") {
                  router.push("/styletype/streetwear")
                  return
                }
                goTo(logicalIndex)
              }}
              className="absolute rounded-none bg-zinc-50 overflow-hidden"
              style={{
                width: frameWidth,
                height: isMobile ? "100%" : "min(64vh, 640px)",
                touchAction: "none",
                WebkitTouchCallout: "none",
                x,
                scale,
                opacity,
                zIndex,
                filter: blur > 0 ? `blur(${blur}px)` : "none",
                willChange: "transform, opacity, filter",
              }}
              transition={{ type: "tween", duration: 0 }}
            >
              <img
                src={look.image || "/placeholder.svg"}
                alt={look.alt}
                draggable={false}
                className="w-full h-full object-cover pointer-events-none"
              />
            </motion.button>
          )
        })}
      </div>

      <LookCaption label={LOOKS[activeImageIndex].label} index={activeImageIndex} count={count} />
    </section>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeading() {
  return (
    <div className="px-6 lg:px-12 mb-10 lg:mb-14 text-center">
      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-400 mb-2">The Edit</p>
      <h2 className="text-[22px] lg:text-[28px] font-light tracking-tight text-zinc-900 leading-tight">
        Looks worth lingering on.
      </h2>
    </div>
  )
}

// Purely informational: names the style direction of whichever look is
// currently centered, and crossfades to the next name as focus changes.
// Never required to navigate — same role the dot indicator used to play.
function LookCaption({
  label,
  index,
  count,
}: {
  label: string
  index: number
  count: number
}) {
  return (
    <div
      className="flex flex-col items-center gap-3 mt-10 lg:mt-14"
      role="status"
      aria-live="polite"
      aria-label="Current look style"
    >
      <div className="relative h-6 lg:h-7 overflow-hidden flex items-center justify-center px-6">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={label}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="text-[13px] lg:text-sm font-mono uppercase tracking-[0.25em] text-zinc-900"
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="w-10 h-px bg-zinc-200 overflow-hidden">
        <motion.div
          className="h-full bg-zinc-900"
          animate={{ width: `${((index + 1) / count) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}
