"use client"

import { useEffect, useState } from "react"
import { Booking } from "@/lib/api/booking"
import { Users } from "@/lib/api/users"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"

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
  const [doctorNames, setDoctorNames] = useState<Record<number, string>>({})

  // ✅ Fetch slots & doctor names
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await Booking.getAvailableSlots()
        const allSlots = res.data.slots || []

        // Sort slots by start_time ascending 🕐
        allSlots.sort(
          (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        )

        setSlots(allSlots)

        // Fetch doctor names
        const uniqueDoctorIds = Array.from(new Set(allSlots.map((s) => s.doctor_id)))
        const doctorMap: Record<number, string> = {}

        await Promise.all(
          uniqueDoctorIds.map(async (id) => {
            try {
              const userRes = await Users.getUserById(id)
              const u = userRes.data
              doctorMap[id] = `${u.first_name} ${u.last_name}`
            } catch {
              doctorMap[id] = `หมอรหัส ${id}`
            }
          })
        )

        setDoctorNames(doctorMap)
      } catch (err: any) {
        console.error("❌ Error fetching slots:", err)
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูลเวลา")
      } finally {
        setLoading(false)
      }
    }
    fetchSlots()
  }, [])

  // ✅ Select a slot
  const handleSelect = (slot: SlotEntity) => {
    setSelectedSlot(slot.id)

    onUpdate({
      slot_id: slot.id,
      doctor_id: slot.doctor_id,
      selectedSlot: slot,
      appointment_time: slot.start_time, // use full ISO
      doctor_name: doctorNames[slot.doctor_id],
    })
  }

  // Group by doctor
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
          {Object.entries(grouped).map(([doctorId, doctorSlots]) => {
            const availableSlots = doctorSlots.filter(
              (s) => s.current_appointment_count < s.max_appointment_count
            )
            if (availableSlots.length === 0) return null

            return (
              <div key={doctorId} className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">แพทย์:</span>
                  <span className="text-gray-600">
                    {doctorNames[Number(doctorId)] || `หมอรหัส ${doctorId}`}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {availableSlots.map((slot) => {
                    const start = new Date(slot.start_time)
                    const label = start.toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })

                    return (
                      <Button
                        key={slot.id}
                        onClick={() => handleSelect(slot)}
                        className={`w-full rounded-md border text-sm transition-all ${
                          selectedSlot === slot.id
                            ? "bg-green-100 text-green-700 border-green-400"
                            : "bg-gray-50 text-gray-800 border-gray-300 hover:bg-gray-200"
                        }`}
                      >
                        {label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          ← กลับ
        </Button>
        <Button
          onClick={() => {
            try {
              onNext()
            } catch (err: any) {
              console.error("❌ Error going next:", err)
              toast.error("ไม่สามารถดำเนินการต่อได้")
            }
          }}
          disabled={!selectedSlot}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          ต่อไป →
        </Button>
      </div>
    </div>
  )
}
