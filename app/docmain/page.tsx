"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { AppointmentBookingWizard } from "@/components/appointment-booking-wizard"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

interface Appointment {
  id: string
  patientName: string
  patientId: string
  date: string
  time: string
  doctor: string
  department: string
  status: "confirmed" | "pending" | "cancelled"
}

const mockAppointments: Appointment[] = [
  {
    id: "XO-069",
    patientName: "คุณสมชาย ใจดี",
    patientId: "XO-069",
    date: "วันที่ 20 สิงหาคม 2569",
    time: "12:00 น.",
    doctor: "นายแพทย์เร่ร่อน จรพเน",
    department: "ห้องตรวจ HIV-69",
    status: "confirmed",
  },
]

export default function AppointmentsPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false)
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)

  const handleNewAppointment = (appointmentData: any) => {
    const newAppointment: Appointment = {
      id: `XO-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
      patientName: appointmentData.patientName || "ผู้ป่วยใหม่",
      patientId: `XO-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
      date: appointmentData.selectedDate,
      time: appointmentData.selectedTime,
      doctor: appointmentData.selectedDoctor,
      department: appointmentData.appointmentType,
      status: "confirmed",
    }
    setAppointments([...appointments, newAppointment])
    setIsBookingOpen(false)
  }

  return (
    <SidebarProvider>
        <AppSidebar />

        {/* ✅ Main content area */}
        <SidebarInset>
          <div className="relative flex-1 p-4 md:p-8">
            {/* Mobile toggle button */}
            <SidebarTrigger />

            {/* Header */}
            <div className="flex items-center justify-between mb-8 mt-4">
              <h1 className="text-3xl font-bold text-gray-900">การนัดพบแพทย์</h1>
              <Button
                onClick={() => setIsBookingOpen(true)}
                className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                เพิ่มการนัดหมาย
              </Button>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card
                  key={appointment.id}
                  className="bg-white border border-gray-200 rounded-lg"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          หมายเลขนัดหมาย {appointment.patientId} คุณหมอนิ่ง พลบรี
                        </p>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {appointment.date}
                        </h3>
                        <p className="text-2xl font-bold text-gray-900 mb-2">
                          {appointment.time}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          โรงพยาบาลศูนย์บริการ
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          ติดตาม {appointment.department}
                        </p>
                        <p className="text-sm text-gray-600">
                          นายแพทย์สรรชัย จงพาน
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="px-4 py-1"
                        >
                          ยกเลิก
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-1">
                          รายละเอียด
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {/* Booking Wizard Modal */}
            <AppointmentBookingWizard
              isOpen={isBookingOpen}
              onClose={() => setIsBookingOpen(false)}
              onComplete={handleNewAppointment}
            />
          </div>
        </SidebarInset>
    </SidebarProvider>
  )
}
