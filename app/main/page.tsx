"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Plus, Calendar, Clock, User } from "lucide-react"
import { AppointmentBookingWizard } from "@/components/appointment-booking-wizard"

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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 p-4">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800">สวัสดี คุณร่อนเร่ พเนจร</h2>
        </div>

        <nav className="space-y-2">
          <div className="flex items-center gap-3 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg">
            <Calendar className="w-5 h-5" />
            <span>จัดการการนัดหมาย</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
            <User className="w-5 h-5" />
            <span>ส่งข้อมูล</span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
            <Clock className="w-5 h-5" />
            <span>ออกจากระบบ</span>
          </div>
        </nav>
      </div>
      {/* Sidebar */}

      {/* Main Content */}
      <div className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
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
              <Card key={appointment.id} className="bg-white border border-gray-200 rounded-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">หมายเลขนัดหมาย {appointment.patientId} คุณหมอนิ่ง พลบรี</p>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{appointment.date}</h3>
                      <p className="text-2xl font-bold text-gray-900 mb-2">{appointment.time}</p>
                      <p className="text-sm text-gray-600 mb-1">โรงพยาบาลศูนย์บริการ</p>
                      <p className="text-sm text-gray-600 mb-1">ติดตาม {appointment.department}</p>
                      <p className="text-sm text-gray-600">นายแพทย์สรรชัย จงพาน</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm" className="px-4 py-1">
                        ยกเลิก
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-1">รายละเอียด</Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Booking Wizard Modal */}
      <AppointmentBookingWizard
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onComplete={handleNewAppointment}
      />
    </div>
  )
}
