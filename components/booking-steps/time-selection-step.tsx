"use client"

import { useEffect, useState } from "react"
import { Booking } from "@/lib/api/booking"
import { Button } from "@/components/ui/button"

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

    // ✅ Merge chosen date with slot time
    const selectedDate = new Date(data.appointment_date)
    const slotTime = new Date(slot.start_time)

    const mergedDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      slotTime.getHours(),
      slotTime.getMinutes(),
      slotTime.getSeconds()
    )

    onUpdate({
      slot_id: slot.id,
      doctor_id: slot.doctor_id,
      selectedSlot: slot,
      appointment_time: mergedDateTime.toISOString(), // 🔥 merged date+time
    })
  }

  // Group slots by doctor
  const grouped = slots.reduce((acc: Record<number, SlotEntity[]>, slot) => {
    if (!acc[slot.doctor_id]) acc[slot.doctor_id] = []
    acc[slot.doctor_id].push(slot)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {loading ? (
        <p>กำลังโหลด slot...</p>
      ) : slots.length === 0 ? (
        <p>ไม่มี slot ว่างในขณะนี้</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([doctorId, doctorSlots]) => (
            <div key={doctorId} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700">หมอรหัส:</span>
                <span className="text-gray-600">{doctorId}</span>
              </div>
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
                      className={`w-full rounded-md border text-sm transition-all ${
                        selectedSlot === slot.id
                          ? "bg-green-100 text-green-700 border-green-400"
                          : isFull
                          ? "bg-red-100 text-red-600 border-red-300"
                          : "bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-200"
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
        <Button variant="outline" onClick={onBack}>← กลับ</Button>
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
