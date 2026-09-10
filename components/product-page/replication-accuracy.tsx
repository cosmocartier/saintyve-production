"use client"

import { Info } from "lucide-react"

interface ReplicationAccuracyProps {
  accuracy?: number | null
}

// Thresholds for accuracy descriptors
const ACCURACY_THRESHOLDS = {
  NEAR_RETAIL: 96,
  VERY_HIGH: 93,
  HIGH_FIDELITY: 90,
} as const

// Maximum displayable value
const MAX_DISPLAY_VALUE = 99

/**
 * Clamps accuracy value and returns descriptor
 */
function getAccuracyData(score: number): { value: number; label: string } {
  const clampedValue = score >= 100 ? MAX_DISPLAY_VALUE : score

  let label: string
  if (clampedValue >= ACCURACY_THRESHOLDS.NEAR_RETAIL) {
    label = "Near-retail detailing"
  } else if (clampedValue >= ACCURACY_THRESHOLDS.VERY_HIGH) {
    label = "Very high detailing"
  } else if (clampedValue >= ACCURACY_THRESHOLDS.HIGH_FIDELITY) {
    label = "High detailing"
  } else {
    label = "Highest detailing"
  }

  return { value: clampedValue, label }
}

export function ReplicationAccuracy({ accuracy }: ReplicationAccuracyProps) {
  // Render nothing if accuracy is missing or null
  if (accuracy == null) {
    return null
  }

  const { value, label } = getAccuracyData(accuracy)
  const position = (value / 100) * 100 // Percentage for positioning dot

  const handleDetailsClick = () => {
    // Placeholder - no action for now
    console.log("[v0] Details clicked")
  }

  return (
    <div className="w-full border-t border-zinc-200/50 pt-6">
      {/* Row 1: Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm tracking-wide font-normal">Production Accuracy</span>
        <button
          onClick={handleDetailsClick}
          aria-label="Show accuracy details"
          className="text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Row 2: Scale visualization */}
      <div className="mb-3">
        <div className="relative h-[1px] bg-zinc-200">
          {/* Filled portion */}
          <div
            className="absolute top-0 left-0 h-full bg-zinc-200 transition-all duration-300"
            style={{ width: `${position}%` }}
          />
          {/* Dot indicator */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-black transition-all duration-300"
            style={{ left: `${position}%` }}
          />
        </div>
        {/* Optional subtle labels */}
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-zinc-400 tracking-wide">low</span>
          <span className="text-[10px] text-zinc-400 tracking-wide">high</span>
        </div>
      </div>

      {/* Row 3: Value and descriptor */}
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-base font-medium tracking-wide">{value} / 100</span>
        <span className="text-[10px] text-zinc-400 tracking-wide">{label}</span>
      </div>

      {/* Row 4: Microcopy */}
      <p className="text-[10px] text-zinc-400 tracking-wide">
        Compared against verified retail reference models.
      </p>
    </div>
  )
}
