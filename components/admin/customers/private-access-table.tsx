"use client"

import { useState } from "react"
import { Clock, Mail, Send, Check, Loader2 } from "lucide-react"

export type PrivateAccessEntry = {
  id: string
  email: string
  source: string
  subscribed_at: string | null
  created_at: string
  token_sent?: boolean
  token_used?: boolean
}

interface PrivateAccessTableProps {
  entries: PrivateAccessEntry[]
  loading: boolean
}

type InviteState = "idle" | "sending" | "sent" | "error"

export function PrivateAccessTable({ entries, loading }: PrivateAccessTableProps) {
  const [inviteStates, setInviteStates] = useState<Record<string, InviteState>>({})

  const handleSendInvite = async (email: string) => {
    setInviteStates((prev) => ({ ...prev, [email]: "sending" }))

    try {
      const res = await fetch("/api/registration/send-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setInviteStates((prev) => ({ ...prev, [email]: "sent" }))
      } else {
        const data = await res.json()
        console.error("[v0] Invite error:", data.error)
        setInviteStates((prev) => ({ ...prev, [email]: "error" }))
        // Reset to idle after 3s so they can retry
        setTimeout(() => setInviteStates((prev) => ({ ...prev, [email]: "idle" })), 3000)
      }
    } catch (err) {
      console.error("[v0] Invite exception:", err)
      setInviteStates((prev) => ({ ...prev, [email]: "error" }))
      setTimeout(() => setInviteStates((prev) => ({ ...prev, [email]: "idle" })), 3000)
    }
  }

  return (
    <div className="rounded-2xl border border-white/8 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/6">
              <th className="px-5 py-3.5 text-left font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25">Email</th>
              <th className="px-5 py-3.5 text-left font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25">Requested</th>
              <th className="px-5 py-3.5 text-left font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25">Status</th>
              <th className="px-5 py-3.5 text-left font-sans text-[9px] font-medium tracking-[0.22em] uppercase text-white/25">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center font-sans text-[10px] tracking-widest uppercase text-white/20">
                  Loading access requests...
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center font-sans text-[10px] tracking-widest uppercase text-white/20">
                  No pending access requests
                </td>
              </tr>
            ) : (
              entries.map((entry) => {
                const localState = inviteStates[entry.email]
                const isSent = localState === "sent" || entry.token_sent
                const isUsed = entry.token_used
                const state: InviteState = localState ?? (isSent ? "sent" : "idle")

                return (
                  <tr key={entry.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-white/20 shrink-0" />
                        <span className="font-sans text-[11px] text-white/60">{entry.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-white/20" />
                        <span className="font-sans text-[11px] text-white/30">
                          {new Date(entry.subscribed_at || entry.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {isUsed ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-sans text-[9px] font-medium uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <span className="w-1 h-1 rounded-full bg-blue-400" />
                          Registered
                        </span>
                      ) : isSent ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-sans text-[9px] font-medium uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1 h-1 rounded-full bg-emerald-400" />
                          Invite Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full font-sans text-[9px] font-medium uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <span className="w-1 h-1 rounded-full bg-amber-400" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleSendInvite(entry.email)}
                        disabled={state === "sending" || isSent}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-sans text-[9px] font-medium tracking-[0.16em] uppercase border transition-all ${
                          isSent
                            ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400/50 cursor-default"
                            : state === "error"
                              ? "border-red-500/20 bg-red-500/5 text-red-400"
                              : state === "sending"
                                ? "border-white/8 bg-white/[0.02] text-white/20 cursor-wait"
                                : "border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.07] hover:text-white/90"
                        }`}
                      >
                        {state === "sending" ? (
                          <><Loader2 className="w-3 h-3 animate-spin" /> Sending</>
                        ) : isSent ? (
                          <><Check className="w-3 h-3" /> Sent</>
                        ) : state === "error" ? (
                          <><Send className="w-3 h-3" /> Retry</>
                        ) : (
                          <><Send className="w-3 h-3" /> Send Invite</>
                        )}
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
