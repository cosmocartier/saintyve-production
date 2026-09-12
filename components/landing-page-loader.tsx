"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

/**
 * Minimal, premium loading overlay for the Saint Yve landing page.
 *
 * The wordmark appears instantly at full scale/opacity, then immediately
 * begins a subtle scale-down + blur + fade that completes well under 600ms.
 * The overlay unmounts itself right after the animation finishes.
 */
export function LandingPageLoader() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 520)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
      <motion.span
        className="text-[22px] font-normal tracking-[0.08em] text-white font-sans uppercase"
        initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        animate={{ opacity: 0, scale: 0.80, filter: "blur(10px)" }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      >
        Saint Yve
      </motion.span>
    </div>
  )
}
