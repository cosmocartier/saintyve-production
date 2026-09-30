"use client"

import { useEffect, useRef } from "react"
import { ShopWithYveWelcome } from "./shop-with-yve-welcome"
import { ShopWithYveMessageRow } from "./shop-with-yve-message"
import type { QuickAction, ShopWithYveMessage } from "./types"

interface ShopWithYveConversationProps {
  messages: ShopWithYveMessage[]
  onSelectQuickAction: (action: QuickAction) => void
}

export function ShopWithYveConversation({ messages, onSelectQuickAction }: ShopWithYveConversationProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages.length])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      {messages.length === 0 ? (
        <ShopWithYveWelcome onSelectQuickAction={onSelectQuickAction} />
      ) : (
        <div className="flex flex-col gap-3 px-5 py-6">
          {messages.map((message) => (
            <ShopWithYveMessageRow key={message.id} message={message} />
          ))}
          <p className="mt-1 text-right text-[10px] font-normal uppercase tracking-[0.16em] text-[#6F7075]">
            Preview &middot; Message not sent
          </p>
        </div>
      )}
    </div>
  )
}
