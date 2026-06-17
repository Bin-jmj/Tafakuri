import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChevronRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface PageHeaderCardProps {
  icon: LucideIcon
  title: string
  description: string
}

export function PageHeaderCard({ icon: Icon, title, description }: PageHeaderCardProps) {
  return (
    <Card className="mb-6 bg-gradient-to-br from-background to-muted/20 border-primary/10 hover:border-primary/30 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl md:text-3xl font-bold">{title}</CardTitle>
            <CardDescription className="text-base mt-1">{description}</CardDescription>
          </div>
        </div>
        <ChevronRight className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
    </Card>
  )
}
