import Link from "next/link"
import { ThemeToggle } from "@/components/shared/ThemeToggle"

export function Header() {
  return (
    <header className="border-b border-border h-16 flex items-center justify-between px-6 bg-background">
      <div className="font-mono font-bold tracking-tighter text-lg flex items-center gap-1">
        ShopAssist<span className="text-[#e8ff57]">•</span>
      </div>
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard" 
          className="text-sm text-muted-foreground hover:text-[#e8ff57] transition-colors font-medium"
        >
          Staff Dashboard →
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}
