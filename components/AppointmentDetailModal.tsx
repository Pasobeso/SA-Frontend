"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface AppointmentDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data?: any
}

export function AppointmentDetailModal({ open, onOpenChange, data }: AppointmentDetailModalProps) {
  if (!data) return null

  const formattedDate = new Date(data.start_time).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
  const formattedTime = new Date(data.start_time).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">รายละเอียดการนัดพบแพทย์</DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <div className="space-y-3 mt-2">
            <InfoRow label="อาการผิดปกติ" value={data.patient_abnormal_symptom} />
            <InfoRow label="มีการขาดยาหรือไม่" value={data.patient_is_missed_medication} />
            <InfoRow label="เจาะเลือดแล้วหรือไม่" value={data.patient_blood_test_status} />
            <InfoRow label="มีการขาดยาหรือไม่" value={data.patient_is_overdue_medication} />
            <InfoRow label="คู่สมรสเป็น HIV หรือไม่" value={data.patient_is_partner_hiv_positive} />

            <hr className="my-3" />
            <p className="text-sm text-gray-700">
              <strong>แพทย์ที่นัด:</strong> {data.doctor_name || `หมอรหัส ${data.doctor_id}`}
            </p>
            <p className="text-sm text-gray-700">
              <strong>วัน-เวลาที่นัด:</strong> {formattedDate} {formattedTime} น.
            </p>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-800">{value || "-"}</span>
    </div>
  )
}
