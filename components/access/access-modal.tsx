"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

interface AccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AccessModal({ open, onOpenChange }: AccessModalProps) {
  const [firstName, setFirstName] = useState("")
  const [source, setSource] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isValid = firstName.trim().length > 0 && source.length > 0 && agreed

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    setIsSubmitting(true)
    const message = encodeURIComponent(
      `Hi, I'd like to request private access.\n\nName: ${firstName}\nFound via: ${source}`
    )
    setTimeout(() => {
      window.open(`https://wa.me/971528079266?text=${message}`, "_blank")
      onOpenChange(false)
      setIsSubmitting(false)
    }, 400)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#F8F7F4] border border-[#E2E0DC] max-w-md w-full p-8 rounded-none shadow-none">
        <DialogHeader className="mb-6">
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#999690] mb-3 font-sans">
            Private Platform
          </p>
          <DialogTitle className="text-[#111111] font-sans text-2xl font-normal leading-snug tracking-tight">
            Request Private Access
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="firstName"
              className="text-[11px] uppercase tracking-[0.15em] text-[#111111] font-sans font-normal"
            >
              First Name <span className="text-[#999690]">*</span>
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              required
              className="rounded-none border-[#D5D3CE] bg-white text-[#111111] placeholder:text-[#BCBAB5] focus-visible:ring-0 focus-visible:border-[#111111] text-sm font-sans transition-colors h-11"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="source"
              className="text-[11px] uppercase tracking-[0.15em] text-[#111111] font-sans font-normal"
            >
              Where did you find us? <span className="text-[#999690]">*</span>
            </Label>
            <Select onValueChange={setSource} value={source}>
              <SelectTrigger
                id="source"
                className="rounded-none border-[#D5D3CE] bg-white text-[#111111] focus:ring-0 focus:border-[#111111] text-sm font-sans h-11 data-[placeholder]:text-[#BCBAB5]"
              >
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent className="rounded-none border-[#D5D3CE] bg-white font-sans">
                <SelectItem value="TikTok" className="text-sm text-[#111111] cursor-pointer focus:bg-[#F0EEE9]">
                  TikTok
                </SelectItem>
                <SelectItem value="Instagram" className="text-sm text-[#111111] cursor-pointer focus:bg-[#F0EEE9]">
                  Instagram
                </SelectItem>
                <SelectItem value="Referral" className="text-sm text-[#111111] cursor-pointer focus:bg-[#F0EEE9]">
                  Referral
                </SelectItem>
                <SelectItem value="Returning client" className="text-sm text-[#111111] cursor-pointer focus:bg-[#F0EEE9]">
                  Returning client
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start gap-3 pt-1">
            <Checkbox
              id="agreement"
              checked={agreed}
              onCheckedChange={(v) => setAgreed(v === true)}
              className="mt-0.5 rounded-none border-[#D5D3CE] data-[state=checked]:bg-[#111111] data-[state=checked]:border-[#111111]"
            />
            <Label
              htmlFor="agreement"
              className="text-xs text-[#666460] leading-relaxed font-sans font-normal cursor-pointer"
            >
              I understand that inventory is shared privately.
            </Label>
          </div>

          <Button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="mt-2 h-12 rounded-none bg-[#111111] text-white hover:bg-[#111111]/85 text-[11px] uppercase tracking-[0.2em] font-sans font-normal transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Connecting..." : "Continue"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
