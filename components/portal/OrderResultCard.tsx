import { StatusBadge } from "../shared/StatusBadge"
import { CopyButton } from "../shared/CopyButton"
import { Calendar } from "lucide-react"

export function OrderResultCard({ order }: { order: any }) {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-900 p-6 flex flex-col gap-4 border-l-2 border-primary">
      <div className="flex justify-between items-start">
        <div className="font-mono text-lg font-bold">{order.orderId}</div>
        <StatusBadge status={order.status} />
      </div>
      
      <div className="text-muted-foreground text-sm font-medium">
        {order.items?.length || 0} items · ₹{order.totalAmount}
      </div>
      
      <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-sm font-mono">
          <span className="text-muted-foreground uppercase text-[10px] tracking-wider">Tracking:</span>
          {order.trackingNumber || "Pending"}
          {order.trackingNumber && <CopyButton value={order.trackingNumber} />}
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground uppercase text-[10px] tracking-wider font-mono">Expected:</span>
          <span className="font-medium">{order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : "TBD"}</span>
        </div>
      </div>
    </div>
  )
}
