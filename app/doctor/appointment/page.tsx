"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Save } from "lucide-react"
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
  const [savingId, setSavingId] = useState<string | null>(null)

  // ✅ โหลด slot ทั้งหมดของหมอ
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

  // ✅ ลบ slot
  const handleDeleteSlot = async (slotId: string) => {
    try {
      await Booking.deleteSlot(slotId)
      toast({ title: "ลบช่วงเวลาเรียบร้อย" })
      setSlots((prev) => prev.filter((s) => s.id !== slotId))
    } catch {
      toast({ title: "ไม่สามารถลบช่วงเวลาได้", variant: "destructive" })
    }
  }

  // ✅ อัปเดตจำนวนคนสูงสุด
  const handleUpdateCount = async (slotId: string, newCount: number) => {
    setSavingId(slotId)
    try {
      await Booking.editSlot(slotId, { max_appointment_count: newCount })
      toast({ title: "อัปเดตจำนวนสำเร็จ" })
      setSlots((prev) =>
        prev.map((s) =>
          s.id === slotId ? { ...s, max_appointment_count: newCount } : s
        )
      )
    } catch {
      toast({
        title: "ไม่สามารถอัปเดตจำนวนได้",
        variant: "destructive",
      })
    } finally {
      setSavingId(null)
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

            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              เพิ่มช่วงเวลา
            </Button>

            {/* Dialog สร้าง slot */}
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

          {/* Slot list */}
{loading ? (
  <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
) : slots.length === 0 ? (
  <p className="text-gray-500">ยังไม่มีช่วงเวลาที่สร้าง</p>
) : (
  <div className="space-y-4">
    {slots
      // ✅ เรียงจากเวลาน้อยไปมาก
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      )
      .map((slot) => {
        // ✅ จัด format เวลาแบบ 24 ชั่วโมง เช่น 08:00 - 09:00
        const start = new Date(slot.start_time)
        const end = new Date(slot.end_time)

        const formatTime = (d: Date) => {
          return d
            .toLocaleTimeString("th-TH", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            })
            .replace(".", ":") // กันไว้กรณี browser แสดงเป็นจุด
        }

        return (
          <Card
            key={slot.id}
            className="bg-white border border-gray-200 rounded-lg shadow-sm"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  {/* ✅ แสดงเวลาเรียงถูก format */}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {formatTime(start)} - {formatTime(end)}
                  </h3>

                  {/* ✅ Editable count */}
                  <div className="flex items-center gap-2 mt-2">
                    <label className="text-sm text-gray-700">
                      จำนวนสูงสุด:
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={slot.max_appointment_count}
                      onChange={(e) => {
                        const newCount = Number(e.target.value)
                        setSlots((prev) =>
                          prev.map((s) =>
                            s.id === slot.id
                              ? { ...s, max_appointment_count: newCount }
                              : s
                          )
                        )
                      }}
                      className="w-24"
                    />
                    <Button
                      size="sm"
                      disabled={savingId === slot.id}
                      onClick={() =>
                        handleUpdateCount(slot.id, slot.max_appointment_count)
                      }
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {savingId === slot.id ? "กำลังบันทึก..." : "บันทึก"}
                    </Button>
                  </div>

                  <p className="text-sm text-gray-400 mt-1">
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
        )
      })}
  </div>
)}

        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
