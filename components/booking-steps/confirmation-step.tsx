"use client"

import { Button } from "@/components/ui/button"
import type { BookingData } from "../appointment-booking-wizard"

type ExtendedBookingData = BookingData & {
  appointment_date?: string
  appointment_time?: string
  doctor_name?: string
}

interface ConfirmationStepProps {
  data: ExtendedBookingData
  onConfirm: () => void
  onBack: () => void
}

export function ConfirmationStep({ data, onConfirm, onBack }: ConfirmationStepProps) {
  const formattedDate =
    data.appointment_time &&
    new Date(data.appointment_time+'Z').toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const formattedTime =
    data.appointment_time &&
    new Date(data.appointment_time+'Z').toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    })

  return (
    <div className="space-y-6">
      <InfoRow label="อาการผิดปกติ" value={data.patient_abnormal_symptom} />
      <InfoRow label="มีการขาดยาหรือไม่" value={data.patient_is_missed_medication} />
      <InfoRow label="มีการตรวจเลือดไหม" value={data.patient_blood_test_status} />
      <InfoRow label="เคยกินยาเกินเวลาหรือไม่" value={data.patient_is_overdue_medication} />
      <InfoRow label="คู่สมรสเป็น HIV หรือไม่" value={data.patient_is_partner_hiv_positive} />

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">แพทย์ที่นัด</h4>
        <p className="text-gray-700">
          {data.doctor_name
            ? data.doctor_name
            : data.selectedSlot?.doctor_id
            ? `หมอรหัส ${data.selectedSlot.doctor_id}`
            : "ยังไม่ได้เลือกแพทย์"}
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-2">เวลาที่นัด</h4>
        { formattedTime ? (
          <p className="text-gray-700"> เวลา {formattedTime}</p>
        ) : (
          <p className="text-gray-500">ยังไม่ได้เลือกวันเวลา</p>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>← กลับ</Button>
        <Button onClick={onConfirm} className="bg-green-600 hover:bg-green-700 text-white">
          ยืนยัน
        </Button>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-200">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium">{value || "-"}</span>
    </div>
  )
}
