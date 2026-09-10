"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ConfirmDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isDeleting?: boolean
}

export function ConfirmDeleteDialog({ open, onOpenChange, onConfirm, isDeleting }: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#131313] border border-white/10 rounded-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-sans text-[15px] font-light uppercase tracking-[0.1em] text-white/90">
            Delete review?
          </AlertDialogTitle>
          <AlertDialogDescription className="font-sans text-[11px] tracking-wide text-white/40">
            This permanently removes the review and its uploaded media. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl border border-white/10 bg-transparent font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white/50 hover:bg-white/[0.05] hover:text-white/80">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-xl bg-red-500/90 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-white hover:bg-red-500 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
