"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { AdminSidebar } from "./admin-sidebar"

interface AdminMobileSidebarSheetProps {
  userEmail: string
}

export function AdminMobileSidebarSheet({ userEmail }: AdminMobileSidebarSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open navigation menu"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-transparent text-white/50 transition-all duration-200 hover:border-white/18 hover:text-white/80"
        >
          <Menu size={15} strokeWidth={1.5} aria-hidden />
        </button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="w-[300px] border-r border-white/8 p-0"
        style={{ backgroundColor: "#0A0A0A" }}
      >
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        <div className="h-full p-4">
          <AdminSidebar userEmail={userEmail} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
