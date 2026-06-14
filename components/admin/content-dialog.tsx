"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { type ReactNode } from "react"
import { Spinner } from "@/components/ui/spinner"

interface ContentDialogProps {
  open: boolean
  onClose: () => void
  title: string
  onSave: () => void
  isSaving?: boolean
  children: ReactNode
}

export function ContentDialog({ open, onClose, title, onSave, isSaving, children }: ContentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">{children}</div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Ghairi</Button>
          <Button onClick={onSave} disabled={isSaving} className="gap-2">
            {isSaving && <Spinner className="h-4 w-4" />}
            Hifadhi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
