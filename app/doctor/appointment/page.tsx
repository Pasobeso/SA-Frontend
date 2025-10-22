"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Save } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-docsidebar";
import { useToast } from "@/hooks/use-toast";
import { Booking } from "@/lib/api/booking";
import { SlotCreationDialog } from "@/components/SlotCreationDialog";

export default function AppointmentsPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // ---------- Time helpers: แปลง "naive UTC" → Date(UTC) แล้วฟอร์แมตเป็นเวลาไทย ----------
  const parseUtcNaive = (input: string) => {
    if (!input) return new Date(NaN);
    const s = input.replace(" ", "T"); // รองรับ "YYYY-MM-DD HH:mm:ss"
    const hasTZ = /[zZ]|[+\-]\d{2}:\d{2}$/.test(s);
    return new Date(hasTZ ? s : `${s}Z`);
  };

  const formatBangkokTime = (d: Date) =>
    new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    })
      .format(d)
      .replace(/\./g, ":");

  const formatBangkokDayMonth = (d: Date) =>
    new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      weekday: "short",
      day: "2-digit",
      month: "short",
    }).format(d);

  // ---------- โหลด slot ----------
  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const res = await Booking.getMySlots();
        if (!res?.data) throw new Error("No data");
        setSlots(res.data.slots ?? []);
      } catch {
        toast({
          title: "ไม่สามารถโหลดช่วงเวลาได้",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
  }, [toast]);

  // ---------- ลบ slot ----------
  const handleDeleteSlot = async (slotId: string) => {
    try {
      await Booking.deleteSlot(slotId);
      toast({ title: "ลบช่วงเวลาเรียบร้อย" });
      setSlots((prev) => prev.filter((s) => s.id !== slotId));
    } catch {
      toast({ title: "ไม่สามารถลบช่วงเวลาได้", variant: "destructive" });
    }
  };

  // ---------- อัปเดตจำนวนคนสูงสุด (เพิ่ม toast ตอนกด) ----------
  const handleUpdateCount = async (slotId: string, newCount: number) => {
    if (!Number.isFinite(newCount) || newCount < 1) {
      toast({ title: "กรุณาใส่จำนวนขั้นต่ำ 1", variant: "destructive" });
      return;
    }

    // Toast ทันทีเมื่อผู้ใช้กดบันทึก
    toast({
      title: "กำลังบันทึก...",
      description: "กำลังอัปเดตจำนวนสูงสุดของช่วงเวลานี้",
      duration: 1200,
    });

    setSavingId(slotId);
    try {
      await Booking.editSlot(slotId, { max_appointment_count: newCount });
      setSlots((prev) =>
        prev.map((s) =>
          s.id === slotId ? { ...s, max_appointment_count: newCount } : s,
        ),
      );
      // Toast เมื่อสำเร็จ
      toast({
        title: "บันทึกแล้ว",
        description: "อัปเดตจำนวนสำเร็จ",
      });
    } catch {
      // Toast เมื่อผิดพลาด
      toast({
        title: "ไม่สามารถอัปเดตจำนวนได้",
        variant: "destructive",
      });
    } finally {
      setSavingId(null);
    }
  };

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
                  const res = await Booking.getMySlots();
                  setSlots(res.data?.slots ?? []);
                  toast({ title: "สร้างช่วงเวลาเรียบร้อย" });
                } catch {
                  toast({
                    title: "ไม่สามารถโหลดช่วงเวลาใหม่ได้",
                    variant: "destructive",
                  });
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
                .sort(
                  (a, b) =>
                    parseUtcNaive(a.start_time).getTime() -
                    parseUtcNaive(b.start_time).getTime(),
                )
                .map((slot) => {
                  const start = parseUtcNaive(slot.start_time);
                  const end = parseUtcNaive(slot.end_time);
                  const isSaving = savingId === slot.id;

                  return (
                    <Card
                      key={slot.id}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            {/* วัน/เดือน (ไทย) */}
                            <div className="text-sm text-gray-600">
                              {formatBangkokDayMonth(start)}
                            </div>

                            {/* เวลา (ไทย, 24 ชม.) */}
                            <h3 className="text-xl font-semibold text-gray-900">
                              {formatBangkokTime(start)} -{" "}
                              {formatBangkokTime(end)}
                            </h3>

                            {/* Editable count */}
                            <div className="flex items-center gap-2 mt-3">
                              <label className="text-sm text-gray-700">
                                จำนวนสูงสุด:
                              </label>
                              <Input
                                type="number"
                                min={1}
                                value={slot.max_appointment_count}
                                onChange={(e) => {
                                  const newCount = Number(e.target.value);
                                  setSlots((prev) =>
                                    prev.map((s) =>
                                      s.id === slot.id
                                        ? {
                                            ...s,
                                            max_appointment_count: newCount,
                                          }
                                        : s,
                                    ),
                                  );
                                }}
                                className="w-24"
                              />
                              <Button
                                size="sm"
                                disabled={
                                  isSaving ||
                                  !Number.isFinite(
                                    slot.max_appointment_count,
                                  ) ||
                                  Number(slot.max_appointment_count) < 1
                                }
                                onClick={() =>
                                  handleUpdateCount(
                                    slot.id,
                                    Number(slot.max_appointment_count),
                                  )
                                }
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <Save className="w-4 h-4 mr-1" />
                                {isSaving ? "กำลังบันทึก..." : "บันทึก"}
                              </Button>
                            </div>

                            <p className="text-sm text-gray-400 mt-2">
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
                  );
                })}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
