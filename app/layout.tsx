import { Geist, DM_Mono } from "next/font/google"

import "./globals.css"
import { Providers } from "./providers"
import { cn } from "@/lib/utils"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "ShopAssist",
  description: "E-commerce Voice AI Support System",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, fontSans.variable)}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
