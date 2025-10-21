"use client"

import { Button } from "@/components/ui/button"
import type { BookingData } from "../appointment-booking-wizard"

interface ConfirmationStepProps {
  data: BookingData
  onConfirm: () => void
  onBack: () => void
}

export function ConfirmationStep({ data, onConfirm, onBack }: ConfirmationStepProps) {
  return (
    <div className="space-y-6">
      {/* Summary of patient information */}
      <div className="space-y-4">
        <div className="flex justify-between py-2 border-b border-gray-200">
          <span className="text-gray-600">อาการผิดปกติ</span>
          <span className="font-medium">{data.patient_abnormal_symptom || "-"}</span>
        </div>

        <div className="flex justify-between py-2 border-b border-gray-200">
          <span className="text-gray-600">มีการขาดยาหรือไม่</span>
          <span className="font-medium">{data.patient_is_missed_medication || "-"}</span>
        </div>

        <div className="flex justify-between py-2 border-b border-gray-200">
          <span className="text-gray-600">มีการตรวจเลือดไหม</span>
          <span className="font-medium">{data.patient_blood_test_status || "-"}</span>
        </div>

        <div className="flex justify-between py-2 border-b border-gray-200">
          <span className="text-gray-600">เคยกินยาเกินเวลาหรือไม่</span>
          <span className="font-medium">{data.patient_is_overdue_medication || "-"}</span>
        </div>

        <div className="flex justify-between py-2 border-b border-gray-200">
          <span className="text-gray-600">คู่สมรสเป็น HIV หรือไม่</span>
          <span className="font-medium">{data.patient_is_partner_hiv_positive || "-"}</span>
        </div>
      </div>

      {/* Selected doctor */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">แพทย์ที่นัด</h4>
        <p className="text-gray-700">
          {data.selectedSlot?.doctor_id
            ? `รหัสแพทย์ ${data.selectedSlot.doctor_id}`
            : "ยังไม่ได้เลือกแพทย์"}
        </p>
      </div>

      {/* Selected time */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">วัน-เวลาที่นัด</h4>
        <p className="text-gray-700">
          {data.selectedSlot
            ? `${new Date(data.selectedSlot.start_time).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })} 
              เวลา ${new Date(data.selectedSlot.start_time).toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : "ยังไม่ได้เลือกวันเวลา"}
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="px-6 py-2 bg-transparent">
          ← กลับ
        </Button>
        <Button
          onClick={onConfirm}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
        >
          ยืนยัน
        </Button>
      </div>
    </div>
  )
}
