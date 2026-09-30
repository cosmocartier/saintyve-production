"use client"

import { useEffect } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useShopWithYve } from "./use-shop-with-yve"
import { ShopWithYveBar } from "./shop-with-yve-bar"
import { ShopWithYvePanel } from "./shop-with-yve-panel"

/**
 * Feature entry point for the Shop With Yve experience. Mounted only from
 * the /collections route so the bar and panel never render anywhere else.
 */
export function ShopWithYve() {
  const { isOpen, open, close, messages, draft, setDraft, submitMessage, selectQuickAction, triggerRef, closeButtonRef } =
    useShopWithYve()
  const isMobile = useIsMobile()

  // Lock background scroll only for the mobile bottom-sheet presentation,
  // where the panel sits on top of the page rather than beside it.
  useEffect(() => {
    if (isOpen && isMobile) {
      const previousOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = previousOverflow
      }
    }
  }, [isOpen, isMobile])

  return (
    <>
      <ShopWithYveBar isOpen={isOpen} onOpen={open} triggerRef={triggerRef} />
      <ShopWithYvePanel
        isOpen={isOpen}
        onClose={close}
        closeButtonRef={closeButtonRef}
        messages={messages}
        draft={draft}
        onDraftChange={setDraft}
        onSubmit={submitMessage}
        onSelectQuickAction={selectQuickAction}
      />
    </>
  )
}
