"use client"

import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { StatsBar } from "@/components/dashboard/StatsBar"
import { CallLogList } from "@/components/dashboard/CallLogList"
import { TicketTable } from "@/components/dashboard/TicketTable"

export default function DashboardPage() {
  return (
    <div className="h-screen bg-neutral-100 dark:bg-neutral-950 text-foreground flex flex-col overflow-hidden">
      <DashboardHeader />
      
      <main className="flex-1 overflow-hidden flex flex-col p-4 sm:p-6 gap-6 min-h-0">
        <div className="shrink-0">
          <StatsBar />
        </div>
        
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-y-auto lg:overflow-hidden pb-10 lg:pb-0">
          <div className="w-full lg:w-[40%] flex flex-col min-h-[500px] lg:min-h-0 shrink-0">
            <CallLogList />
          </div>
          
          <div className="w-full lg:w-[60%] flex flex-col min-h-[600px] lg:min-h-0 shrink-0 lg:shrink">
            <TicketTable />
          </div>
        </div>
      </main>
    </div>
  )
}
