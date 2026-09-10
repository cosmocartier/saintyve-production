"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Send, User, ImageIcon, X } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import Image from "next/image"

type Message = {
  id: string
  case_id: string
  sender_id: string
  message: string
  image_url?: string | null
  read_by_admin: boolean
  read_by_supplier: boolean
  created_at: string
  sender_profile?: {
    email: string
    full_name: string | null
    role: string
  }
}

type InvestigationChatDialogProps = {
  isOpen: boolean
  onClose: () => void
  caseData: any
  currentUserId: string
  userRole: string
}

export function InvestigationChatDialog({
  isOpen,
  onClose,
  caseData,
  currentUserId,
  userRole,
}: InvestigationChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    if (isOpen && caseData) {
      fetchMessages()

      // Real-time subscription for messages
      const channel = supabase
        .channel(`case-messages-${caseData.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "investigation_messages",
            filter: `case_id=eq.${caseData.id}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              fetchMessages()
            }
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [isOpen, caseData])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("investigation_messages")
      .select(
        `
        *,
        sender_profile:profiles!investigation_messages_sender_id_fkey (
          email,
          full_name,
          role
        )
      `,
      )
      .eq("case_id", caseData.id)
      .order("created_at", { ascending: true })

    if (data) {
      setMessages(data)

      // Mark messages as read
      if (userRole === "admin") {
        await supabase
          .from("investigation_messages")
          .update({ read_by_admin: true })
          .eq("case_id", caseData.id)
          .eq("read_by_admin", false)
      } else if (userRole === "supplier") {
        await supabase
          .from("investigation_messages")
          .update({ read_by_supplier: true })
          .eq("case_id", caseData.id)
          .eq("read_by_supplier", false)
      }
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB")
        return
      }
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }
      setSelectedImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload image")
    }

    const { url } = await response.json()
    return url
  }

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedImage) || sending) return

    setSending(true)
    setUploading(true)

    try {
      let messageText = newMessage.trim() || ""

      if (selectedImage) {
        const imageUrl = await uploadImage(selectedImage)
        // Append image URL to message text
        messageText = messageText ? `${messageText}\n\n[Image: ${imageUrl}]` : `[Image: ${imageUrl}]`
      }

      const { data, error } = await supabase
        .from("investigation_messages")
        .insert({
          case_id: caseData.id,
          sender_id: currentUserId,
          message: messageText,
          read_by_admin: userRole === "admin",
          read_by_supplier: userRole === "supplier",
        })
        .select(
          `
          *,
          sender_profile:profiles!investigation_messages_sender_id_fkey (
            email,
            full_name,
            role
          )
        `,
        )
        .single()

      if (error) {
        console.error("[v0] Error sending message:", error)
        alert("Failed to send message")
        setSending(false)
        setUploading(false)
        return
      }

      if (data) {
        setMessages((prev) => [...prev, data])
      }

      setNewMessage("")
      setSelectedImage(null)
      setImagePreview(null)
    } catch (error) {
      console.error("[v0] Error in handleSendMessage:", error)
      alert("Failed to send message")
    } finally {
      setSending(false)
      setUploading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-black/10">
          <DialogTitle className="tracking-widest uppercase">
            <div className="flex items-center justify-between">
              <span>Case #{caseData.id.slice(0, 8)}</span>
              <span className="text-xs font-normal text-zinc-500 uppercase">{caseData.title}</span>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-zinc-500 text-sm py-12">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg) => {
              const isOwnMessage = msg.sender_id === currentUserId
              return (
                <div key={msg.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className="flex items-center gap-2 px-2">
                      <User className="w-3 h-3 text-zinc-400" />
                      <span className="text-xs text-zinc-500">
                        {msg.sender_profile?.full_name || msg.sender_profile?.email}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        isOwnMessage ? "bg-black text-white" : "bg-zinc-100 text-black"
                      }`}
                    >
                      {msg.message && <p className="text-sm whitespace-pre-wrap">{msg.message}</p>}
                      {msg.image_url && (
                        <div className="mt-2">
                          <Image
                            src={msg.image_url || "/placeholder.svg"}
                            alt="Attachment"
                            width={300}
                            height={200}
                            className="rounded-lg object-cover max-w-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-black/10 bg-white">
          {imagePreview && (
            <div className="px-6 pt-4">
              <div className="relative inline-block">
                <Image
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  width={80}
                  height={80}
                  className="rounded-lg object-cover border border-black/10"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null)
                    setImagePreview(null)
                  }}
                  className="absolute -top-2 -right-2 bg-black text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="flex items-end gap-3">
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={sending || uploading}
                className="flex-shrink-0 w-10 h-10 rounded-full border border-black/20 hover:border-black flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Attach image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <div className="flex-1 relative">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="w-full resize-none border border-black/20 focus:border-black rounded-lg px-4 py-3 pr-12 min-h-[48px] max-h-[120px] text-sm transition-colors"
                  disabled={sending || uploading}
                  rows={1}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && !selectedImage) || sending || uploading}
                  className="absolute right-2 bottom-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Send message"
                >
                  {uploading ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-[10px] text-zinc-400 mt-2 px-1">Press Enter to send • Shift + Enter for new line</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
