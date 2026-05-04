import { Badge } from "@/components/ui/badge"
import type { CallOutcome } from "@/types"

export function OutcomeBadge({ outcome }: { outcome: CallOutcome | null }) {
  if (!outcome) {
    return (
      <Badge variant="outline" className="text-muted-foreground font-mono rounded-none text-[10px] uppercase tracking-wider bg-transparent">
        In Progress
      </Badge>
    )
  }

  const config = {
    resolved: { color: "bg-green-500 text-white", label: "Resolved by AI" },
    escalated: { color: "bg-amber-500 text-black", label: "Escalated" },
    failed: { color: "bg-red-500 text-white", label: "No Action" },
  }

  const { color, label } = config[outcome]

  return (
    <Badge className={`${color} font-mono rounded-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider hover:${color}`}>
      {label}
    </Badge>
  )
}
