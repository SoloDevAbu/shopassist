"use client"

import * as React from "react"
import { Header } from "@/components/portal/Header"
import { OrderLookupForm } from "@/components/portal/OrderLookupForm"
import { SupportForm } from "@/components/portal/SupportForm"
import { CallbackForm } from "@/components/portal/CallbackForm"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"

export default function CustomerPortal() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="mx-auto flex w-full max-w-[600px] flex-1 flex-col px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mb-12 space-y-2"
        >
          <h1 className="text-3xl font-bold tracking-tight">
            Your AI support assistant.
          </h1>
          <p className="text-muted-foreground">
            Track orders, raise tickets, or talk to our agent — instantly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.05, ease: "easeOut" }}
        >
          <Tabs defaultValue="track" className="w-full">
            <TabsList className="mb-8 grid w-full grid-cols-3 rounded-none bg-neutral-100 p-1 dark:bg-neutral-900">
              <TabsTrigger
                value="track"
                className="rounded-none text-xs font-bold tracking-wider uppercase data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Track Order
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="rounded-none text-xs font-bold tracking-wider uppercase data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Contact Agent
              </TabsTrigger>
            </TabsList>

            <TabsContent value="track" className="mt-0 outline-none">
              <OrderLookupForm />
            </TabsContent>

            <TabsContent value="contact" className="mt-0 outline-none">
              <CallbackForm />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  )
}
