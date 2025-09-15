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
  const [currentMonth, setCurrentMonth] = useState(7) // August (0-indexed)
  const [currentYear, setCurrentYear] = useState(2568)
  const [selectedDate, setSelectedDate] = useState<number | null>(
    data.selectedDate ? Number.parseInt(data.selectedDate.split(" ")[1]) : null,
  )

  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ]

  const daysInMonth = new Date(currentYear - 543, currentMonth + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear - 543, currentMonth, 1).getDay()

  const days = []
  const dayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  const handleDateSelect = (day: number) => {
    setSelectedDate(day)
    const dateString = `${day} ${thaiMonths[currentMonth]} ${currentYear}`
    onUpdate({ selectedDate: dateString })
  }

  const handleNext = () => {
    if (selectedDate) {
      onNext()
    }
  }

  const navigateMonth = (direction: "prev" | "next") => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11)
        setCurrentYear(currentYear - 1)
      } else {
        setCurrentMonth(currentMonth - 1)
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0)
        setCurrentYear(currentYear + 1)
      } else {
        setCurrentMonth(currentMonth + 1)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigateMonth("prev")} className="p-1">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {thaiMonths[currentMonth]} {currentYear}
        </h3>
        <Button variant="ghost" size="sm" onClick={() => navigateMonth("next")} className="p-1">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {dayLabels.map((label) => (
          <div key={label} className="text-center text-sm font-medium text-gray-500 py-2">
            {label}
          </div>
        ))}
        {days.map((day, index) => (
          <div key={index} className="aspect-square">
            {day && (
              <button
                onClick={() => handleDateSelect(day)}
                className={`w-full h-full rounded-lg text-sm font-medium transition-colors ${
                  selectedDate === day ? "bg-blue-600 text-white" : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Selected Date Display */}
      {selectedDate && (
        <div className="text-center py-4 bg-gray-50 rounded-lg">
          <p className="text-lg font-semibold text-gray-800">
            {selectedDate} {thaiMonths[currentMonth]} {currentYear}
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="px-6 py-2 bg-transparent">
          ← กลับ
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedDate}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
        >
          ต่อไป →
        </Button>
      </div>
    </div>
  )
}
