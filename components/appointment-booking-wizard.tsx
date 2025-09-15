"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PatientInfoStep } from "./booking-steps/patient-info-step"
import { DateSelectionStep } from "./booking-steps/date-selection-step"
import { TimeSelectionStep } from "./booking-steps/time-selection-step"
import { ConfirmationStep } from "./booking-steps/confirmation-step"

interface AppointmentBookingWizardProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: any) => void
}

export interface BookingData {
  patientName: string
  appointmentType: string
  bloodTestBefore: string
  bloodTestAfter: string
  hivRiskLast5Years: string
  hivTestResult: string
  selectedDate: string
  selectedTime: string
  selectedDoctor: string
}

export function AppointmentBookingWizard({ isOpen, onClose, onComplete }: AppointmentBookingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState<BookingData>({
    patientName: "",
    appointmentType: "",
    bloodTestBefore: "",
    bloodTestAfter: "",
    hivRiskLast5Years: "",
    hivTestResult: "",
    selectedDate: "",
    selectedTime: "",
    selectedDoctor: "",
  })

  const totalSteps = 4

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    onComplete(bookingData)
    setCurrentStep(1)
    setBookingData({
      patientName: "",
      appointmentType: "",
      bloodTestBefore: "",
      bloodTestAfter: "",
      hivRiskLast5Years: "",
      hivTestResult: "",
      selectedDate: "",
      selectedTime: "",
      selectedDoctor: "",
    })
  }

  const updateBookingData = (updates: Partial<BookingData>) => {
    setBookingData((prev) => ({ ...prev, ...updates }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PatientInfoStep data={bookingData} onUpdate={updateBookingData} onNext={handleNext} />
      case 2:
        return (
          <DateSelectionStep data={bookingData} onUpdate={updateBookingData} onNext={handleNext} onBack={handleBack} />
        )
      case 3:
        return (
          <TimeSelectionStep data={bookingData} onUpdate={updateBookingData} onNext={handleNext} onBack={handleBack} />
        )
      case 4:
        return <ConfirmationStep data={bookingData} onConfirm={handleComplete} onBack={handleBack} />
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
            {currentStep === 2 && "2. เลือกวันที่จะนัดแพทย์"}
            {currentStep === 3 && "3. เลือกแพทย์"}
            {currentStep === 4 && "4. ยืนยันการนัดพบแพทย์"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">{renderStep()}</div>
      </DialogContent>
    </Dialog>
  )
}
