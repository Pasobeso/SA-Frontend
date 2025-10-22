"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Booking } from "@/lib/api/booking"
import { toast } from "react-toastify"

export function SlotCreationDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: () => void
}) {
  const today = new Date()
  const [selectedBlocks, setSelectedBlocks] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)

  const timeBlocks = [
    { start: "08:00", end: "09:00" },
    { start: "09:00", end: "10:00" },
    { start: "10:00", end: "11:00" },
    { start: "11:00", end: "12:00" },
    { start: "13:00", end: "14:00" },
    { start: "14:00", end: "15:00" },
    { start: "15:00", end: "16:00" },
    { start: "16:00", end: "17:00" },
  ]

  const progress = 100

  const toggleBlock = (label: string) => {
    setSelectedBlocks((prev) => {
      const newState = { ...prev }
      if (label in newState) delete newState[label]
      else newState[label] = 10
      return newState
    })
  }

  const updateCount = (label: string, value: number) => {
    setSelectedBlocks((prev) => ({ ...prev, [label]: value }))
  }

// ✅ ปรับ format ให้เป็น NaiveDateTime (ไม่ผูก timezone และไม่มี Z)
const makeDateTime = (date: Date, time: string) => {
  const [h, m] = time.split(":").map(Number)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(h).padStart(2, "0")
  const minute = String(m).padStart(2, "0")
  // ✅ Format: YYYY-MM-DDTHH:mm:ss (ไม่มี Z, ไม่มี timezone)
  return `${year}-${month}-${day}T${hour}:${minute}:00`
}


  const handleCreate = async () => {
    const entries = Object.entries(selectedBlocks)
    if (entries.length === 0) {
      toast.error("กรุณาเลือกช่วงเวลาอย่างน้อยหนึ่งช่วง")
      return
    }

    const date = today // ใช้วันที่วันนี้เป็น default

    setSaving(true)
    try {
      console.log("🟢 Sending slots to API:", entries)

      await Promise.all(
        entries.map(async ([label, count]) => {
          const [start, end] = label.split("-")
          const start_time = makeDateTime(date, start)
          const end_time = makeDateTime(date, end)
          const payload = { start_time, end_time, max_appointment_count: count || 10 }

          console.log("→ Creating slot:", payload)
          const res = await Booking.addSlot(payload)
          console.log("✅ Created:", res)
          return res
        })
      )

      toast.success("สร้างช่วงเวลาเรียบร้อย")
      onOpenChange(false)
      onCreated()
      setSelectedBlocks({})
    } catch (err) {
      console.error("❌ Error creating slots:", err)
      toast.error("ไม่สามารถสร้างช่วงเวลาได้")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-2xl">
        <DialogHeader>
          <DialogTitle>สร้างช่วงเวลานัดหมาย</DialogTitle>
          <DialogDescription>
            เลือกช่วงเวลาและจำนวนคนที่ต้องการเปิดให้คนไข้นัด
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-2 bg-gray-200 mb-4" />

        <h3 className="font-medium text-gray-700 mb-3">
          เลือกช่วงเวลาและจำนวนคน (ไม่กรอก = 10)
        </h3>

        <div className="grid grid-cols-2 gap-1">
          {timeBlocks.map((b) => {
            const label = `${b.start}-${b.end}`
            const selected = label in selectedBlocks
            return (
              <div key={label} className="border rounded-lg p-3 flex flex-col items-center">
                <Button
                  variant={selected ? "default" : "outline"}
                  className={`w-full py-3 text-base font-medium ${
                    selected ? "bg-green-600 text-white" : "hover:bg-green-50"
                  }`}
                  onClick={() => toggleBlock(label)}
                >
                  {b.start}-{b.end}
                </Button>
                {selected && (
                  <Input
                    type="number"
                    min={1}
                    value={selectedBlocks[label]}
                    onChange={(e) =>
                      updateCount(label, Number(e.target.value) || 10)
                    }
                    className="mt-2 w-24 text-center"
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleCreate}
            disabled={saving || Object.keys(selectedBlocks).length === 0}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
          >
            {saving ? "กำลังบันทึก..." : "ตกลง"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
