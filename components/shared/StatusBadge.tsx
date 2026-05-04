import { Badge } from "@/components/ui/badge"

type Status = 
  | "processing" | "shipped" | "delivered" | "cancelled"
  | "pending" | "completed" | "rejected"
  | "active" | "paused"
  | "open" | "in_progress" | "resolved" | "closed"
  | "initiated" | "failed"

export function StatusBadge({ status }: { status: Status }) {
  let color = "bg-neutral-500 text-white"

  switch (status) {
    case "delivered":
    case "completed":
    case "resolved":
    case "closed":
    case "active":
      color = "bg-green-500 text-white"
      break
    case "shipped":
    case "in_progress":
    case "paused":
      color = "bg-amber-500 text-black"
      break
    case "cancelled":
    case "rejected":
    case "failed":
      color = "bg-red-500 text-white"
      break
    case "processing":
    case "pending":
    case "open":
    case "initiated":
      color = "bg-blue-500 text-white"
      break
  }

  return (
    <Badge className={`uppercase ${color} font-mono rounded-none px-2 py-0.5 text-[10px] font-bold tracking-wider hover:${color}`}>
      {status.replace("_", " ")}
    </Badge>
  )
}
