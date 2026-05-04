"use client"

import * as React from "react"
import { Header } from "@/components/portal/Header"
import { OrderLookupForm } from "@/components/portal/OrderLookupForm"
import { SupportForm } from "@/components/portal/SupportForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

export default function CustomerPortal() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-[600px] w-full mx-auto px-6 py-12 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-2 mb-12"
        >
          <h1 className="text-3xl font-bold tracking-tight">Voice support, now in writing.</h1>
          <p className="text-muted-foreground">Check your order or raise a ticket.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05, ease: "easeOut" }}
        >
          <Tabs defaultValue="track" className="w-full">
            <TabsList className="grid w-full grid-cols-2 rounded-none bg-neutral-100 dark:bg-neutral-900 p-1 mb-8">
              <TabsTrigger value="track" className="rounded-none data-[state=active]:bg-background data-[state=active]:shadow-sm">Track Order</TabsTrigger>
              <TabsTrigger value="support" className="rounded-none data-[state=active]:bg-background data-[state=active]:shadow-sm">Get Support</TabsTrigger>
            </TabsList>
            
            <TabsContent value="track" className="mt-0 outline-none">
              <OrderLookupForm />
            </TabsContent>
            
            <TabsContent value="support" className="mt-0 outline-none">
              <SupportForm />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}
