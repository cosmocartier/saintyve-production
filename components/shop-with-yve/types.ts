export interface ShopWithYveMessage {
  id: string
  content: string
  createdAt: number
}

export interface QuickAction {
  id: string
  label: string
  draft: string
}

/**
 * Contract for a future message submission handler. The current build only
 * implements a local preview handler (see use-shop-with-yve.ts), but any real
 * messaging/AI service can be wired in later by supplying a handler with this
 * shape — no changes to the bar, panel, header, welcome, conversation, or
 * composer components are required.
 */
export type MessageSubmissionHandler = (content: string) => void | Promise<void>
