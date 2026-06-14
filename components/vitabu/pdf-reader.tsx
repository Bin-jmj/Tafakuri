"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut, AlertCircle } from "lucide-react"
import { useReadingProgress } from "@/hooks/use-reading-progress"
import type { PDFDocumentProxy } from "pdfjs-dist"

interface PdfReaderProps {
  fileUrl: string
  bookId: string
}

export function PdfReader({ fileUrl, bookId }: PdfReaderProps) {
  const { progress, loaded, signedIn, saveProgress } = useReadingProgress("book", bookId)

  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [scale, setScale] = useState(1)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")
  const [restored, setRestored] = useState(false)
  const [pageInput, setPageInput] = useState("1")

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const renderTaskRef = useRef<{ cancel: () => void; promise: Promise<unknown> } | null>(null)

  // Load the PDF document
  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        // Use the legacy build: it includes polyfills (e.g. Uint8Array.prototype.toHex)
        // required by browsers like Brave or 360 Extreme that lack newer JS APIs.
        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs")
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString()

        const doc = await pdfjsLib.getDocument({ url: new URL(fileUrl, window.location.origin) }).promise
        if (!active) return
        setPdfDoc(doc)
        setNumPages(doc.numPages)
        setStatus("ready")
      } catch (error) {
        console.error("[pdf-reader] failed to load", error)
        if (active) setStatus("error")
      }
    })()
    return () => {
      active = false
    }
  }, [fileUrl])

  // Restore saved page once both the PDF and the saved progress are ready
  useEffect(() => {
    if (status !== "ready" || !loaded || restored) return
    if (progress?.currentPage) {
      setPageNum(Math.min(Math.max(1, progress.currentPage), numPages))
    }
    setRestored(true)
  }, [status, loaded, restored, progress, numPages])

  // Render the current page onto the canvas
  const renderPage = useCallback(async (num: number, renderScale: number) => {
    if (!pdfDoc || !canvasRef.current) return

    // Cancel any in-flight render before starting a new one — pdfjs throws if
    // the same canvas is used for two concurrent render() operations.
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel()
      await renderTaskRef.current.promise.catch(() => {})
    }

    const page = await pdfDoc.getPage(num)
    const viewport = page.getViewport({ scale: renderScale })
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    canvas.width = viewport.width
    canvas.height = viewport.height

    const task = page.render({ canvasContext: ctx, viewport, canvas })
    renderTaskRef.current = task
    try {
      await task.promise
    } catch (error) {
      if (error instanceof Error && error.name === "RenderingCancelledException") return
      throw error
    } finally {
      if (renderTaskRef.current === task) renderTaskRef.current = null
    }
  }, [pdfDoc])

  // Compute a scale that fits the container width
  useEffect(() => {
    if (!pdfDoc || !containerRef.current) return
    let active = true
    ;(async () => {
      const page = await pdfDoc.getPage(pageNum)
      const viewport = page.getViewport({ scale: 1 })
      const containerWidth = containerRef.current?.clientWidth ?? viewport.width
      if (active) setScale((containerWidth / viewport.width) * 1)
    })()
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfDoc, pageNum])

  useEffect(() => {
    if (status !== "ready" || !restored) return
    renderPage(pageNum, scale)
  }, [status, restored, pageNum, scale, renderPage])

  // Persist progress whenever the page changes
  useEffect(() => {
    if (!signedIn || status !== "ready" || !restored || numPages === 0) return
    saveProgress({
      progressPercent: Math.round((pageNum / numPages) * 100),
      currentPage: pageNum,
      totalPages: numPages,
    })
  }, [pageNum, numPages, signedIn, status, restored, saveProgress])

  // Keep the page-jump input in sync with the current page
  useEffect(() => {
    setPageInput(String(pageNum))
  }, [pageNum])

  const goPrev = () => setPageNum((p) => Math.max(1, p - 1))
  const goNext = () => setPageNum((p) => Math.min(numPages, p + 1))
  const zoomIn = () => setScale((s) => Math.min(3, s + 0.2))
  const zoomOut = () => setScale((s) => Math.max(0.4, s - 0.2))

  const jumpToPage = () => {
    const num = parseInt(pageInput, 10)
    if (Number.isNaN(num)) {
      setPageInput(String(pageNum))
      return
    }
    setPageNum(Math.min(Math.max(1, num), numPages))
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
        <AlertCircle className="h-8 w-8" />
        <p className="text-sm">Imeshindikana kupakia kitabu. Tafadhali jaribu tena baadaye.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Progress */}
      {numPages > 0 && (
        <div className="flex items-center gap-3">
          <Progress value={(pageNum / numPages) * 100} className="h-1.5 flex-1" />
          <div className="flex items-center gap-1.5 text-xs flex-shrink-0">
            <span className="text-muted-foreground">Ukurasa</span>
            <Input
              type="number"
              min={1}
              max={numPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={jumpToPage}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  jumpToPage()
                }
              }}
              className="h-7 w-16 px-2 text-center"
              aria-label="Nenda kwenye ukurasa"
            />
            <span className="text-muted-foreground">/ {numPages}</span>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div ref={containerRef} className="relative w-full overflow-auto rounded-lg border bg-muted/30 flex justify-center min-h-[300px]">
        {status === "loading" && (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Inapakia kitabu...
          </div>
        )}
        <canvas ref={canvasRef} className={status === "ready" ? "max-w-full" : "hidden"} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goPrev} disabled={pageNum <= 1} className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Iliyotangulia
          </Button>
          <Button variant="outline" size="sm" onClick={goNext} disabled={pageNum >= numPages} className="gap-1">
            Inayofuata
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={zoomOut} className="h-8 w-8" aria-label="Punguza ukubwa">
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" onClick={zoomIn} className="h-8 w-8" aria-label="Ongeza ukubwa">
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {!signedIn && (
        <p className="text-xs text-muted-foreground text-center">
          Ingia kwenye akaunti yako ili maendeleo yako ya kusoma yahifadhiwe.
        </p>
      )}
    </div>
  )
}
