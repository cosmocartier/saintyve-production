"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

interface ToastNotificationProps {
  message: string
  type: "success" | "error"
  onClose: () => void
  duration?: number
}

export function ToastNotification({ message, type, onClose, duration = 4000 }: ToastNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="min-w-[320px] max-w-md rounded-md bg-black/40 p-4 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-light text-white leading-relaxed">{message}</p>
          </div>
          <button onClick={onClose} className="flex-shrink-0 text-white/70 hover:text-white transition-colors">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>
    </div>
  )
}
