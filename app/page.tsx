"use client"

import { Header } from "@/components/portal/Header"
import { OrderLookupForm } from "@/components/portal/OrderLookupForm"
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
            <TabsList className="mb-8 grid w-full grid-cols-2 rounded-none bg-neutral-100 p-1 dark:bg-neutral-900">
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

        {/* Test Data Collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: 0.1, ease: "easeOut" }}
          className="mt-8"
        >
          <details className="group rounded-none border border-border bg-neutral-50 dark:bg-neutral-900">
            <summary className="cursor-pointer list-none p-4 text-xs font-bold tracking-wider uppercase text-muted-foreground outline-none group-open:border-b group-open:border-border">
              <div className="flex items-center justify-between">
                <span>Test Data</span>
                <span className="transition-transform group-open:rotate-180">
                  ▼
                </span>
              </div>
            </summary>
            <div className="p-4">
              <ul className="space-y-2 font-mono text-xs">
                <li className="flex justify-between border-b border-border/50 pb-2">
                  <span>alice@example.com</span>
                  <span className="font-bold text-primary">ORD-00001</span>
                </li>
                <li className="flex justify-between border-b border-border/50 pb-2">
                  <span>bob@example.com</span>
                  <span className="font-bold text-primary">ORD-00002</span>
                </li>
                <li className="flex justify-between border-b border-border/50 pb-2">
                  <span>carol@example.com</span>
                  <span className="font-bold text-primary">ORD-00003</span>
                </li>
                <li className="flex justify-between border-b border-border/50 pb-2">
                  <span>dave@example.com</span>
                  <span className="font-bold text-primary">ORD-00004</span>
                </li>
                <li className="flex justify-between">
                  <span>eve@example.com</span>
                  <span className="font-bold text-primary">ORD-00005</span>
                </li>
              </ul>
            </div>
          </details>
        </motion.div>
      </main>
    </div>
  )
}
