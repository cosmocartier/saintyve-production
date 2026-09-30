"use client"

import { useRef, type KeyboardEvent } from "react"
import { ArrowUp } from "lucide-react"

interface ShopWithYveComposerProps {
  draft: string
  onDraftChange: (value: string) => void
  onSubmit: (content: string) => void
}

export function ShopWithYveComposer({ draft, onDraftChange, onSubmit }: ShopWithYveComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const canSend = draft.trim().length > 0

  const handleSubmit = () => {
    if (!canSend) return
    onSubmit(draft)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Avoid submitting while an IME composition (CJK input) is in progress,
    // and treat Safari's unreliable final composition keyCode as composing too.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
      event.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="shrink-0 border-t border-black/10 px-4 py-3">
      <div className="flex items-end gap-2">
        <label htmlFor="shop-with-yve-composer" className="sr-only">
          Write your message
        </label>
        <textarea
          ref={textareaRef}
          id="shop-with-yve-composer"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write your message…"
          rows={1}
          className="flex-1 resize-none border border-black/10 bg-transparent px-3 py-2.5 text-[13px] font-normal leading-relaxed text-[#111111] placeholder:text-[#9A9A9A] focus:border-black/30 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          aria-label="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center border border-black/10 text-[#111111] transition-colors disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:border-black/30"
        >
          <ArrowUp className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
