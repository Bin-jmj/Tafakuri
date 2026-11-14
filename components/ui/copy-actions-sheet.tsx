"use client"

import { useEffect, useState } from "react"
import { Copy, ImageIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

/**
 * Bottom sheet on touch screens (native-app feel), centered dialog on
 * desktop. Both render the same two actions: download as image, copy text.
 */
export function CopyActionsSheet({
  trigger,
  description,
  onCopy,
  onDownload,
  downloading,
}: {
  trigger: React.ReactNode
  description: string
  onCopy: () => void
  onDownload: () => void
  downloading: boolean
}) {
  const [open, setOpen] = useState(false)
  const isDesktop = useIsDesktop()

  const closeAnd = (action: () => void) => () => {
    setOpen(false)
    action()
  }

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-xs">
          <DialogHeader>
            <DialogTitle>Nakili</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={closeAnd(onDownload)} disabled={downloading}>
              <ImageIcon className="mr-1.5 h-4 w-4" />
              Pakua
            </Button>
            <Button variant="outline" onClick={closeAnd(onCopy)}>
              <Copy className="mr-1.5 h-4 w-4" />
              Nakili
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="pb-2">
          <DrawerTitle>Nakili</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <div className="grid grid-cols-2 gap-2 px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          <Button variant="outline" onClick={closeAnd(onDownload)} disabled={downloading}>
            <ImageIcon className="mr-1.5 h-4 w-4" />
            Pakua
          </Button>
          <Button variant="outline" onClick={closeAnd(onCopy)}>
            <Copy className="mr-1.5 h-4 w-4" />
            Nakili
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

/** SSR-safe: starts false (mobile), corrects after mount via matchMedia. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const query = window.matchMedia("(min-width: 640px)")
    const update = () => setIsDesktop(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])
  return isDesktop
}
