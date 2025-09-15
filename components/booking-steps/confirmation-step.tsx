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
      <div className="space-y-4">
        <div className="flex justify-between py-2 border-b border-gray-200">
          <span className="text-gray-600">อายุคลินิก</span>
          <span className="font-medium">{data.patientName || "เว็บไซต์ เว็บไซต์จ่า ฯ"}</span>
        </div>

        <div className="flex justify-between py-2 border-b border-gray-200">
          <span className="text-gray-600">มีการตรวจเลือดไหม</span>
          <span className="font-medium">{data.bloodTestBefore || "มี"}</span>
        </div>

        <div className="flex justify-between py-2 border-b border-gray-200">
          <span className="text-gray-600">เจาะเลือดแล้วครั้งไหม</span>
          <span className="font-medium">{data.bloodTestAfter || "เจาะแล้ว ผลเป็น HIV"}</span>
        </div>

        <div className="flex justify-between py-2 border-b border-gray-200">
          <span className="text-gray-600">มีการตรวจเลือดไหม</span>
          <span className="font-medium">{data.hivRiskLast5Years || "มี"}</span>
        </div>

        <div className="flex justify-between py-2 border-b border-gray-200">
          <span className="text-gray-600">ผู้ประเมิน HIV หรือไม่</span>
          <span className="font-medium">{data.hivTestResult || "ใช่"}</span>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">แพทย์ที่นัด</h4>
        <p className="text-gray-700">{data.selectedDoctor || "นายแพทย์สรรชัย จงพาน"}</p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">วัน-เวลาที่นัด</h4>
        <p className="text-gray-700">
          {data.selectedDate || "12 สิงหาคม 2568"} {data.selectedTime || "9:30"} น.
        </p>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="px-6 py-2 bg-transparent">
          ← กลับ
        </Button>
        <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg">
          ยืนยัน
        </Button>
      </div>
    </div>
  )
}
