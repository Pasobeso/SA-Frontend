"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Plus } from "lucide-react"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-docsidebar"
import { Booking } from "@/lib/api/booking"
import { useToast } from "@/hooks/use-toast"
import { AppointmentDetailModal } from "@/components/AppointmentDetailModal"

export default function AppointmentsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await Booking.getDoctorAppointments()
        if (!res.data) throw new Error("No data returned")
        setAppointments(res.data.schedules)
      } catch (err) {
        console.error(err)
        toast({
          title: "ไม่สามารถโหลดข้อมูลการนัดหมายได้",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchAppointments()
  }, [])

  const handlePrescribe = (appointmentId: string) => {
    router.push(`/doctor/med/${appointmentId}`)
  }

  const handleViewDetail = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsModalOpen(true)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="relative flex-1 p-4 md:p-8">
          <SidebarTrigger />
          <div className="flex items-center justify-between mb-8 mt-4">
            <h1 className="text-3xl font-bold text-gray-900">การนัดพบผู้ป่วย</h1>
          </div>

          {loading ? (
            <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray-500">ยังไม่มีการนัดหมาย</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="bg-white border border-gray-200 rounded-lg">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          หมายเลขนัดหมาย {appointment.id}
                        </p>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          วันที่{" "}
                          {new Date(appointment.start_time).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </h3>
                        <p className="text-xl font-bold text-gray-900 mb-2">
                          {new Date(appointment.start_time).toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewDetail(appointment)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                        >
                          รายละเอียด
                        </Button>
                        <Button
                          onClick={() => handlePrescribe(appointment.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                        >
                          สั่งยา
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>

        <AppointmentDetailModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          data={selectedAppointment}
        />
      </SidebarInset>
    </SidebarProvider>
  )
}
