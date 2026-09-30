"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { QuickAction, ShopWithYveMessage } from "./types"

let messageIdCounter = 0
function createMessageId() {
  messageIdCounter += 1
  return `swy-${Date.now()}-${messageIdCounter}`
}

/**
 * Centralizes all interaction state for the Shop With Yve experience: open/
 * closed state, the local message preview, the composer draft, and focus
 * management. This is a front-end-only prototype — messages never leave the
 * browser and no backend is contacted.
 */
export function useShopWithYve() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ShopWithYveMessage[]>([])
  const [draft, setDraft] = useState("")

  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Move focus into the panel on open, and return it to the trigger on close.
  useEffect(() => {
    if (isOpen) {
      // Wait a tick so the panel has mounted before focusing into it.
      const raf = requestAnimationFrame(() => {
        closeButtonRef.current?.focus()
      })
      return () => cancelAnimationFrame(raf)
    }

    triggerRef.current?.focus()
  }, [isOpen])

  // Escape closes the panel from anywhere while it's open.
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, close])

  const submitMessage = useCallback((content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return

    setMessages((prev) => [
      ...prev,
      {
        id: createMessageId(),
        content: trimmed,
        createdAt: Date.now(),
      },
    ])
    setDraft("")
  }, [])

  // Quick actions populate the composer with an editable starting message,
  // but must never silently discard text the customer has already written.
  const selectQuickAction = useCallback((action: QuickAction) => {
    setDraft((current) => (current.trim() ? current : action.draft))
  }, [])

  return {
    isOpen,
    open,
    close,
    messages,
    draft,
    setDraft,
    submitMessage,
    selectQuickAction,
    triggerRef,
    closeButtonRef,
  }
}
