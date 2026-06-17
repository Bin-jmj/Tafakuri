import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, type LucideIcon } from "lucide-react"
import Link from "next/link"

interface FeatureCardProps {
  title: string
  description: string
  icon: LucideIcon
  href: string
  gradient: string
}

export function FeatureCard({ title, description, icon: Icon, href, gradient }: FeatureCardProps) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-all hover:shadow-lg hover:border-primary cursor-pointer overflow-hidden">
        <div className={`h-2 ${gradient}`} />
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-primary">
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="ghost" className="gap-2 group-hover:gap-3 transition-all p-0">
            Ingia
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}
