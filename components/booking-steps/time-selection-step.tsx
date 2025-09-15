"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { BookingData } from "../appointment-booking-wizard"

interface TimeSelectionStepProps {
  data: BookingData
  onUpdate: (updates: Partial<BookingData>) => void
  onNext: () => void
  onBack: () => void
}

interface TimeSlot {
  time: string
  available: boolean
  doctor: string
}

const morningSlots: TimeSlot[] = [
  { time: "9:00", available: true, doctor: "นายแพทย์สรรชัย จงพาน" },
  { time: "9:30", available: true, doctor: "นายแพทย์สรรชัย จงพาน" },
  { time: "10:00", available: false, doctor: "นายแพทย์สรรชัย จงพาน" },
  { time: "10:30", available: false, doctor: "นายแพทย์สรรชัย จงพาน" },
  { time: "11:00", available: true, doctor: "นายแพทย์สรรชัย จงพาน" },
  { time: "11:30", available: false, doctor: "นายแพทย์สรรชัย จงพาน" },
  { time: "12:00", available: false, doctor: "นายแพทย์สรรชัย จงพาน" },
  { time: "12:30", available: false, doctor: "นายแพทย์สรรชัย จงพาน" },
  { time: "13:00", available: false, doctor: "นายแพทย์สรรชัย จงพาน" },
  { time: "13:30", available: false, doctor: "นายแพทย์สรรชัย จงพาน" },
]

const afternoonSlots: TimeSlot[] = [
  { time: "9:00", available: true, doctor: "อีกแพทย์หนึ่ง" },
  { time: "9:30", available: true, doctor: "อีกแพทย์หนึ่ง" },
  { time: "10:00", available: false, doctor: "อีกแพทย์หนึ่ง" },
  { time: "10:30", available: false, doctor: "อีกแพทย์หนึ่ง" },
  { time: "11:00", available: true, doctor: "อีกแพทย์หนึ่ง" },
  { time: "11:30", available: false, doctor: "อีกแพทย์หนึ่ง" },
]

export function TimeSelectionStep({ data, onUpdate, onNext, onBack }: TimeSelectionStepProps) {
  // Use a unique slotId = doctor + time
  const [selectedSlotId, setSelectedSlotId] = useState<string>(
    data.selectedTime && data.selectedDoctor ? `${data.selectedDoctor}-${data.selectedTime}` : ""
  )

  const handleTimeSelect = (slot: TimeSlot) => {
    if (slot.available) {
      const slotId = `${slot.doctor}-${slot.time}`
      setSelectedSlotId(slotId)
      onUpdate({ selectedTime: slot.time, selectedDoctor: slot.doctor })
    }
  }

  const handleNext = () => {
    if (selectedSlotId) {
      onNext()
    }
  }

  const renderTimeSlots = (slots: TimeSlot[], title: string) => (
    <div className="mb-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">{title}</h4>
      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot) => {
          const slotId = `${slot.doctor}-${slot.time}`
          return (
            <button
              key={slotId}
              onClick={() => handleTimeSelect(slot)}
              disabled={!slot.available}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSlotId === slotId
                  ? "bg-blue-600 text-white"
                  : slot.available
                    ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    : "bg-red-500 text-white cursor-not-allowed"
              }`}
            >
              {slot.time}
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {renderTimeSlots(morningSlots, "นายแพทย์สรรชัย จงพาน")}
      {renderTimeSlots(afternoonSlots, "อีกแพทย์หนึ่ง")}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="px-6 py-2 bg-transparent">
          ← กลับ
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedSlotId}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          ต่อไป →
        </Button>
      </div>
    </div>
  )
}
