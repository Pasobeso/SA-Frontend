"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PatientInfoStep } from "./booking-steps/patient-info-step"
import { DateSelectionStep } from "./booking-steps/date-selection-step"
import { TimeSelectionStep } from "./booking-steps/time-selection-step"
import { ConfirmationStep } from "./booking-steps/confirmation-step"
import { Booking } from "@/lib/api/booking"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

interface AppointmentBookingWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: any) => void
}

// ✅ Backend-aligned structure for booking data
export interface BookingData {
  slot_id: string
  selectedSlot?: {
    start_time: string
    end_time: string
    doctor_id: number
  }
  selectedDate?: string
  selectedTime?: string
  appointment_date?: string     // ✅ เพิ่ม
  appointment_time?: string     // ✅ เพิ่ม
  patient_abnormal_symptom: string
  patient_is_missed_medication: string
  patient_blood_test_status: string
  patient_is_overdue_medication: string
  patient_is_partner_hiv_positive: string
}


export function AppointmentBookingWizard({
  isOpen,
  onClose,
  onComplete,
}: AppointmentBookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  // ✅ initialize with backend fields
  const [bookingData, setBookingData] = useState<BookingData>({
    slot_id: "",
    patient_abnormal_symptom: "",
    patient_is_missed_medication: "",
    patient_blood_test_status: "",
    patient_is_overdue_medication: "",
    patient_is_partner_hiv_positive: "",
  })

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep((s) => s + 1)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1)
  }

  // ✅ Working handleComplete for react-toastify
const handleComplete = async () => {
  try {
    const yesNoToText = (val: string | boolean) =>
      val === true || val === "เคย" || val === "ตรวจแล้ว" || val === "ใช่"
        ? "เคย"
        : "ไม่เคย"

    const localData = { ...bookingData }

    // 🕒 สร้าง start / end จากเวลาที่เลือกจริง
    const start = new Date(localData.appointment_time || localData.selectedSlot?.start_time || new Date())
    const end = new Date(start.getTime() + 60 * 60 * 1000) // +1 ชม.

    const payload = {
      slot_id: localData.slot_id,
      doctor_id: localData.selectedSlot?.doctor_id,      // ✅ เพิ่ม
      start_time: start.toISOString(),                   // ✅ ส่งวันเวลาเต็ม
      end_time: end.toISOString(),
      patient_abnormal_symptom: localData.patient_abnormal_symptom || "-",
      patient_is_missed_medication: yesNoToText(localData.patient_is_missed_medication),
      patient_blood_test_status: yesNoToText(localData.patient_blood_test_status),
      patient_is_overdue_medication: yesNoToText(localData.patient_is_overdue_medication),
      patient_is_partner_hiv_positive: yesNoToText(localData.patient_is_partner_hiv_positive),
    }

    console.log("✅ Final payload:", payload)
    const res = await Booking.addAppointment(payload)

    toast.success("บันทึกการนัดหมายสำเร็จ 🎉", { position: "top-right" })
    setTimeout(() => onClose(), 200)
    if (typeof onComplete === "function") onComplete(res)
  } catch (err) {
    console.error(err)
    toast.error("ไม่สามารถบันทึกการนัดหมายได้ ❌", { position: "top-right" })
  }
}



  const updateBookingData = (updates: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...updates }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PatientInfoStep
            data={bookingData}
            onUpdate={updateBookingData}
            onNext={handleNext}
          />
        )
      case 2:
        return (
          <DateSelectionStep
            data={bookingData}
            onUpdate={updateBookingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 3:
        return (
          <TimeSelectionStep
            data={bookingData}
            onUpdate={updateBookingData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )
      case 4:
        return (
          <ConfirmationStep
            data={bookingData}
            onConfirm={handleComplete}
            onBack={handleBack}
          />
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {currentStep === 1 && "1. ใส่ข้อมูลเพื่อนัดหมาย"}
            {currentStep === 2 && "2. เลือกวันที่นัดหมาย"}
            {currentStep === 3 && "3. เลือกช่วงเวลา / หมอ"}
            {currentStep === 4 && "4. ยืนยันการนัดหมาย"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">{renderStep()}</div>
      </DialogContent>
    </Dialog>
  )
}
