"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Plus } from "lucide-react"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-docsidebar"
import { useToast } from "@/hooks/use-toast"
import { Booking } from "@/lib/api/booking"
import { SlotCreationDialog } from "@/components/SlotCreationDialog"

export default function AppointmentsPage() {
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ✅ Load doctor’s existing slots
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await Booking.getMySlots()
        if (!res.data) throw new Error("No data")
        setSlots(res.data.slots)
      } catch {
        toast({
          title: "ไม่สามารถโหลดช่วงเวลาได้",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchSlots()
  }, [])

  // ✅ Delete slot
  const handleDeleteSlot = async (slotId: string) => {
    try {
      await Booking.deleteSlot(slotId)
      toast({ title: "ลบช่วงเวลาเรียบร้อย" })
      setSlots((prev) => prev.filter((s) => s.id !== slotId))
    } catch {
      toast({ title: "ไม่สามารถลบช่วงเวลาได้", variant: "destructive" })
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="relative flex-1 p-4 md:p-8">
          <SidebarTrigger />

          {/* Header Section */}
          <div className="flex items-center justify-between mb-8 mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              จัดการช่วงเวลานัดหมาย
            </h1>

            {/* ✅ Open SlotCreationDialog */}
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              เลือกช่วงเวลา
            </Button>

            {/* ✅ Themed Slot Creation Dialog */}
            <SlotCreationDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              onCreated={async () => {
                try {
                  const res = await Booking.getMySlots()
                  setSlots(res.data?.slots ?? [])
                } catch {
                  toast({
                    title: "ไม่สามารถโหลดช่วงเวลาใหม่ได้",
                    variant: "destructive",
                  })
                }
              }}
            />
          </div>

          {/* ✅ Slot list */}
          {loading ? (
            <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
          ) : slots.length === 0 ? (
            <p className="text-gray-500">ยังไม่มีช่วงเวลาที่สร้าง</p>
          ) : (
            <div className="space-y-4">
              {slots.map((slot) => (
                <Card
                  key={slot.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {new Date(slot.start_time).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </h3>
                        <p className="text-sm text-gray-700">
                          {new Date(slot.start_time).toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(slot.end_time).toLocaleTimeString("th-TH", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="text-sm text-gray-500">
                          จำนวนสูงสุด: {slot.max_appointment_count} คน
                        </p>
                        <p className="text-sm text-gray-400">
                          จองแล้ว: {slot.current_appointment_count} คน
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteSlot(slot.id)}
                      >
                        ลบ
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
