import { Badge } from "@/components/ui/badge"
import type { TicketPriority } from "@/types"

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const colors = {
    high: "bg-red-500 hover:bg-red-600 text-white border-transparent",
    medium: "bg-amber-500 hover:bg-amber-600 text-black border-transparent",
    low: "bg-blue-500 hover:bg-blue-600 text-white border-transparent",
  }

  return (
    <Badge variant="outline" className={`font-mono uppercase ${colors[priority]} rounded-none px-2 py-0.5 text-[10px] font-bold tracking-wider`}>
      {priority}
    </Badge>
  )
}
