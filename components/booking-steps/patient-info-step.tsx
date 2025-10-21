"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { BookingData } from "../appointment-booking-wizard"

interface PatientInfoStepProps {
  data: BookingData
  onUpdate: (updates: Partial<BookingData>) => void
  onNext: () => void
}

export function PatientInfoStep({ data, onUpdate, onNext }: PatientInfoStepProps) {
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    const allFilled =
      data.patient_abnormal_symptom?.trim() &&
      data.patient_is_missed_medication &&
      data.patient_blood_test_status &&
      data.patient_is_overdue_medication &&
      data.patient_is_partner_hiv_positive

    setIsValid(Boolean(allFilled))
  }, [data])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* อาการผิดปกติ */}
      <div>
        <Label htmlFor="abnormal" className="text-sm font-medium text-gray-700">
          อาการผิดปกติ
        </Label>
        <Input
          id="abnormal"
          placeholder="ถ้าไม่มี โปรดใส่ -"
          value={data.patient_abnormal_symptom}
          onChange={(e) => onUpdate({ patient_abnormal_symptom: e.target.value })}
          className="mt-1"
        />
      </div>

      {/* มีการขาดยาหรือไม่ */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          มีการขาดยาหรือไม่
        </Label>
        <RadioGroup
          value={data.patient_is_missed_medication}
          onValueChange={(value) => onUpdate({ patient_is_missed_medication: value })}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="เคย" id="missed-yes" />
            <Label htmlFor="missed-yes" className="text-sm">มี</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ไม่เคย" id="missed-no" />
            <Label htmlFor="missed-no" className="text-sm">ไม่มี</Label>
          </div>
        </RadioGroup>
      </div>

      {/* สถานะการตรวจเลือด */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          สถานะการตรวจเลือด
        </Label>
        <RadioGroup
          value={data.patient_blood_test_status}
          onValueChange={(value) => onUpdate({ patient_blood_test_status: value })}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ตรวจแล้ว" id="blood-done" />
            <Label htmlFor="blood-done" className="text-sm">ตรวจแล้ว</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ยังไม่ได้ตรวจ" id="blood-not" />
            <Label htmlFor="blood-not" className="text-sm">ยังไม่ได้ตรวจ</Label>
          </div>
        </RadioGroup>
      </div>

      {/* มีประวัติกินยาต้านเกิน 5 นาทีหรือไม่ */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          มีประวัติกินยาต้านเกิน 5 นาทีหรือไม่
        </Label>
        <RadioGroup
          value={data.patient_is_overdue_medication}
          onValueChange={(value) => onUpdate({ patient_is_overdue_medication: value })}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="เคย" id="overdue-yes" />
            <Label htmlFor="overdue-yes" className="text-sm">มี</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ไม่เคย" id="overdue-no" />
            <Label htmlFor="overdue-no" className="text-sm">ไม่มี</Label>
          </div>
        </RadioGroup>
      </div>

      {/* คู่สมรสเป็น HIV หรือไม่ */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-3 block">
          คู่สมรสเป็น HIV หรือไม่
        </Label>
        <RadioGroup
          value={data.patient_is_partner_hiv_positive}
          onValueChange={(value) => onUpdate({ patient_is_partner_hiv_positive: value })}
          className="space-y-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ใช่" id="partner-hiv-yes" />
            <Label htmlFor="partner-hiv-yes" className="text-sm">ใช่</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ไม่ใช่" id="partner-hiv-no" />
            <Label htmlFor="partner-hiv-no" className="text-sm">ไม่ใช่</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={!isValid}
          className={`px-6 py-2 rounded-lg text-white ${
            isValid ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          ต่อไป →
        </Button>
      </div>
    </form>
  )
}
