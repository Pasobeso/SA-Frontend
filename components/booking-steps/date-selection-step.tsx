"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { BookingData } from "../appointment-booking-wizard"

interface DateSelectionStepProps {
  data: BookingData
  onUpdate: (updates: Partial<BookingData>) => void
  onNext: () => void
  onBack: () => void
}

export function DateSelectionStep({ data, onUpdate, onNext, onBack }: DateSelectionStepProps) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear() + 543)
  const [selectedDate, setSelectedDate] = useState<number | null>(null)

  const thaiMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ]

  const daysInMonth = new Date(currentYear - 543, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear - 543, currentMonth, 1).getDay()

  const days: (number | null)[] = []
  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  for (let i = 0; i < firstDayOfMonth; i++) days.push(null)
  for (let day = 1; day <= daysInMonth; day++) days.push(day)

  const handleDateSelect = (day: number) => {
    const selected = new Date(currentYear - 543, currentMonth, day)
    const now = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    if (selected < now) return

    setSelectedDate(day)

    // ✅ store full ISO date
    const isoDate = selected.toISOString()
    onUpdate({
      selectedSlot: undefined,
      slot_id: "",
      appointment_date: isoDate, // 🔥 store as ISO date
    } as any)

  }

  const handleNext = () => {
    if (selectedDate) onNext()
  }

  const navigateMonth = (direction: "prev" | "next") => {
    const thisMonth = today.getMonth()
    const thisYear = today.getFullYear() + 543

    if (direction === "prev") {
      if (currentYear === thisYear && currentMonth === thisMonth) return
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else setCurrentMonth(currentMonth - 1)
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else setCurrentMonth(currentMonth + 1)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")} className="p-1">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-semibold">{thaiMonths[currentMonth]} {currentYear}</h3>
        <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")} className="p-1">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {dayLabels.map((label) => (
          <div key={label} className="text-center text-sm font-medium text-gray-500 py-2">
            {label}
          </div>
        ))}
        {days.map((day, index) => {
          if (day === null) return <div key={index}></div>

          const dateObj = new Date(currentYear - 543, currentMonth, day)
          const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate())

          return (
            <div key={index} className="aspect-square">
              <button
                disabled={isPast}
                onClick={() => handleDateSelect(day)}
                className={`w-full h-full rounded-lg text-sm font-medium transition-colors ${
                  isPast
                    ? "text-gray-300 cursor-not-allowed"
                    : selectedDate === day
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {day}
              </button>
            </div>
          )
        })}
      </div>

      {/* Selected */}
      {selectedDate && (
        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <p className="text-lg font-semibold text-gray-800">
            {selectedDate} {thaiMonths[currentMonth]} {currentYear}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>← กลับ</Button>
        <Button onClick={handleNext} disabled={!selectedDate} className="bg-green-600 hover:bg-green-700 text-white">
          ต่อไป →
        </Button>
      </div>
    </div>
  )
}
