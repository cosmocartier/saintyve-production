"use client"

import type { RefObject } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useIsMobile } from "@/hooks/use-mobile"
import { ShopWithYveHeader } from "./shop-with-yve-header"
import { ShopWithYveConversation } from "./shop-with-yve-conversation"
import { ShopWithYveComposer } from "./shop-with-yve-composer"
import type { QuickAction, ShopWithYveMessage } from "./types"

interface ShopWithYvePanelProps {
  isOpen: boolean
  onClose: () => void
  closeButtonRef: RefObject<HTMLButtonElement | null>
  messages: ShopWithYveMessage[]
  draft: string
  onDraftChange: (value: string) => void
  onSubmit: (content: string) => void
  onSelectQuickAction: (action: QuickAction) => void
}

export function ShopWithYvePanel({
  isOpen,
  onClose,
  closeButtonRef,
  messages,
  draft,
  onDraftChange,
  onSubmit,
  onSelectQuickAction,
}: ShopWithYvePanelProps) {
  const isMobile = useIsMobile()

  const panelContent = (
    <>
      <ShopWithYveHeader onClose={onClose} closeButtonRef={closeButtonRef} />
      <ShopWithYveConversation messages={messages} onSelectQuickAction={onSelectQuickAction} />
      <ShopWithYveComposer draft={draft} onDraftChange={onDraftChange} onSubmit={onSubmit} />
    </>
  )

  return (
    <AnimatePresence>
      {isOpen &&
        (isMobile ? (
          <div key="shop-with-yve-mobile" className="fixed inset-0 z-50">
            <motion.div
              className="absolute inset-0 bg-black/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Shop With Yve, personal shopping"
              className="absolute inset-x-0 bottom-0 flex h-[88dvh] max-h-[calc(100dvh-24px)] flex-col bg-white"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.22, ease: [0.2, 0.7, 0.3, 1] }}
            >
              {panelContent}
            </motion.div>
          </div>
        ) : (
          <motion.div
            key="shop-with-yve-desktop"
            role="dialog"
            aria-label="Shop With Yve, personal shopping"
            className="fixed bottom-[68px] right-6 z-50 flex w-[420px] max-w-[90vw] flex-col border border-black/10 bg-white"
            style={{ height: "min(580px, calc(100dvh - 100px))" }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: [0.2, 0.7, 0.3, 1] }}
          >
            {panelContent}
          </motion.div>
        ))}
    </AnimatePresence>
  )
}
