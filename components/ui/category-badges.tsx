import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CategoryBadgesProps {
  categories: string[]
  className?: string
  variant?: "secondary" | "outline"
}

export function CategoryBadges({ categories, className, variant = "secondary" }: CategoryBadgesProps) {
  if (categories.length === 0) return null
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {categories.map((category) => (
        <Badge key={category} variant={variant} className="text-xs">{category}</Badge>
      ))}
    </div>
  )
}
