"use client"

import { Bills } from "@/components/Bills"
import { useStore } from "@/store/useStore"
import { useEffect } from "react"

export default function BillsPage() {
  const processAutoPay = useStore(state => state.processAutoPay)

  useEffect(() => {
    // Run AutoPay check when visiting the bills page
    processAutoPay()
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-tr from-[#fdf2f8] via-[#F8F8F8] to-[#f1f5f9] py-4">
      <Bills />
    </main>
  )
}
