"use client"

import { useEffect, useState } from "react"
import { Booking } from "@/lib/api/booking"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface TimeSelectionStepProps {
  data: any
  onUpdate: (updates: any) => void
  onNext: () => void
  onBack: () => void
}

interface SlotEntity {
  id: string
  doctor_id: number
  start_time: string
  end_time: string
  current_appointment_count: number
  max_appointment_count: number
}

export function TimeSelectionStep({ data, onUpdate, onNext, onBack }: TimeSelectionStepProps) {
  const [slots, setSlots] = useState<SlotEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(data.slot_id || null)

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await Booking.getAvailableSlots()
        setSlots(res.data.slots)
      } catch (err) {
        console.error("Error fetching slots:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchSlots()
  }, [])

  const handleSelect = (slot: SlotEntity) => {
    setSelectedSlot(slot.id)
    onUpdate({
      slot_id: slot.id,
      selectedSlot: slot,
    })
  }

  // ✅ Group slot ตาม doctor_id
  const grouped = slots.reduce((acc: Record<number, SlotEntity[]>, slot) => {
    if (!acc[slot.doctor_id]) acc[slot.doctor_id] = []
    acc[slot.doctor_id].push(slot)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <h2 className="font-semibold text-lg">3. เลือกช่วงเวลา / หมอ</h2>

      {loading ? (
        <p>กำลังโหลด slot...</p>
      ) : slots.length === 0 ? (
        <p>ไม่มี slot ว่างในขณะนี้</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([doctorId, doctorSlots]) => (
            <div key={doctorId}>
              <p className="font-medium mb-3">
                หมอรหัส: {doctorId}
              </p>
              <div className="grid grid-cols-5 gap-2">
                {doctorSlots.map((slot) => {
                  const isFull = slot.current_appointment_count >= slot.max_appointment_count
                  const start = new Date(slot.start_time)
                  const label = start.toLocaleTimeString("th-TH", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })

                  return (
                    <Button
                      key={slot.id}
                      disabled={isFull}
                      onClick={() => handleSelect(slot)}
                      className={`w-full ${
                        selectedSlot === slot.id
                          ? "bg-green-500 text-white"
                          : isFull
                          ? "bg-red-500 text-white"
                          : "bg-white text-black border"
                      }`}
                    >
                      {label}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← กลับ
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedSlot}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          ต่อไป →
        </Button>
      </div>
    </div>
  )
}
