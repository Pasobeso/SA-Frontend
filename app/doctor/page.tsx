"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-docsidebar";
import { Booking } from "@/lib/api/booking";
import { useToast } from "@/hooks/use-toast";
import { AppointmentDetailModal } from "@/components/AppointmentDetailModal";

export default function AppointmentsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ---- Time helpers: parse "naive UTC" -> Date(UTC) then format in Asia/Bangkok ----
  const parseUtcNaive = (input: string) => {
    if (!input) return new Date(NaN);
    const s = input.replace(" ", "T"); // รองรับ "YYYY-MM-DD HH:mm:ss"
    const hasTZ = /[zZ]|[+\-]\d{2}:\d{2}$/.test(s);
    return new Date(hasTZ ? s : `${s}Z`);
  };

  const formatBangkokDate = (d: Date) =>
    new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);

  const formatBangkokTime = (d: Date) =>
    new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    })
      .format(d)
      .replace(/\./g, ":");

  // ---- โหลดรายการนัด ----
  const fetchAppointments = async () => {
    try {
      const res = await Booking.getDoctorAppointments();
      if (!res.data) throw new Error("No data returned");
      setAppointments(res.data.schedules ?? []);
    } catch (err) {
      console.error(err);
      toast({
        title: "ไม่สามารถโหลดข้อมูลการนัดหมายได้",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleViewDetail = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  // ---- แปลงสถานะให้เป็นรูปแบบมาตรฐาน ----
  type CanonicalStatus =
    | "WAITING"
    | "READY"
    | "WAITING_FOR_PRESCRIPTION"
    | "COMPLETED";
  const normalizeStatus = (s: any): CanonicalStatus => {
    const x = String(s || "")
      .toUpperCase()
      .replace(/[\s\-_]/g, "");
    if (x === "READY") return "READY";
    if (x === "WAITINGFORPRESCRIPTION") return "WAITING_FOR_PRESCRIPTION";
    if (x === "COMPLETED") return "COMPLETED";
    // ค่าเริ่มต้น/กรณีอื่น ๆ ถือเป็น WAITING
    // รองรับชื่ออย่าง BOOKED / SCHEDULED / PENDING ด้วย
    if (["WAITING", "BOOKED", "SCHEDULED", "PENDING", "CONFIRMED"].includes(x))
      return "WAITING";
    return "WAITING";
  };

  const patchLocalStatus = (id: string, status: CanonicalStatus) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    );
  };

  // ---- Actions: เปลี่ยนสถานะตามลำดับ ----
  const toReady = async (id: string) => {
    setUpdatingId(id);
    toast({ title: "กำลังอัปเดต...", description: "ไปสถานะ Ready" });
    try {
      await Booking.markAsReady(id);
      patchLocalStatus(id, "READY");
      toast({ title: "อัปเดตสำเร็จ", description: "สถานะ: Ready" });
    } catch {
      toast({ title: "อัปเดตไม่สำเร็จ", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const toWaitingForPrescription = async (id: string) => {
    setUpdatingId(id);
    toast({
      title: "กำลังอัปเดต...",
      description: "ไปสถานะ Waiting for Prescription",
    });
    try {
      await Booking.markAsWaitingForPrescription(id);
      patchLocalStatus(id, "WAITING_FOR_PRESCRIPTION");
      toast({
        title: "อัปเดตสำเร็จ",
        description: "สถานะ: Waiting for Prescription",
      });
    } catch {
      toast({ title: "อัปเดตไม่สำเร็จ", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  // สั่งยา (mock) → Completed
  const mockPrescribeToCompleted = async (id: string) => {
    setUpdatingId(id);
    toast({ title: "สั่งยา (mock)...", description: "กำลังปิดเคสนี้" });
    try {
      await Booking.markAsCompleted(id);
      patchLocalStatus(id, "COMPLETED");
      toast({ title: "เสร็จสิ้น", description: "สถานะ: Completed" });
    } catch {
      toast({ title: "อัปเดตไม่สำเร็จ", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  // ---- ปุ่มหลักให้ตรงกับสถานะ ----
  const PrimaryAction = ({ appt }: { appt: any }) => {
    const status = normalizeStatus(appt.status);

    if (status === "WAITING") {
      return (
        <Button
          disabled={updatingId === appt.id}
          onClick={() => toReady(appt.id)}
          className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md"
        >
          Ready
        </Button>
      );
    }

    if (status === "READY") {
      return (
        <Button
          disabled={updatingId === appt.id}
          onClick={() => toWaitingForPrescription(appt.id)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md"
        >
          Waiting for Prescription
        </Button>
      );
    }

    if (status === "WAITING_FOR_PRESCRIPTION") {
      return (
        <Button
          disabled={updatingId === appt.id}
          onClick={() => mockPrescribeToCompleted(appt.id)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          สั่งยา (mock)
        </Button>
      );
    }

    // COMPLETED → ไม่มีปุ่มหลัก
    return (
      <Button
        disabled
        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md cursor-not-allowed"
      >
        Completed
      </Button>
    );
  };

  // ---- แท็กสถานะแบบสีอ่านง่าย ----
  const StatusBadge = ({ status }: { status: any }) => {
    const s = normalizeStatus(status);
    const style: Record<CanonicalStatus, string> = {
      WAITING: "bg-yellow-100 text-yellow-800",
      READY: "bg-amber-100 text-amber-800",
      WAITING_FOR_PRESCRIPTION: "bg-indigo-100 text-indigo-800",
      COMPLETED: "bg-green-100 text-green-800",
    };
    const label: Record<CanonicalStatus, string> = {
      WAITING: "Waiting",
      READY: "Ready",
      WAITING_FOR_PRESCRIPTION: "Waiting for Prescription",
      COMPLETED: "Completed",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style[s]}`}
      >
        {label[s]}
      </span>
    );
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="relative flex-1 p-4 md:p-8">
          <SidebarTrigger />
          <div className="flex items-center justify-between mb-8 mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              การนัดพบผู้ป่วย
            </h1>
            <Button className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" />
              เพิ่มการนัดหมาย
            </Button>
          </div>

          {loading ? (
            <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
          ) : appointments.length === 0 ? (
            <p className="text-gray-500">ยังไม่มีการนัดหมาย</p>
          ) : (
            <div className="space-y-4">
              {appointments
                .slice()
                .sort(
                  (a, b) =>
                    parseUtcNaive(a.start_time).getTime() -
                    parseUtcNaive(b.start_time).getTime(),
                )
                .map((appointment) => {
                  const start = parseUtcNaive(appointment.start_time);
                  const end = appointment.end_time
                    ? parseUtcNaive(appointment.end_time)
                    : null;

                  return (
                    <Card
                      key={appointment.id}
                      className="bg-white border border-gray-200 rounded-lg"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm text-gray-600">
                                หมายเลขนัดหมาย {appointment.id}
                              </p>
                              <StatusBadge status={appointment.status} />
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              วันที่ {formatBangkokDate(start)}
                            </h3>

                            <p className="text-xl font-bold text-gray-900 mb-2">
                              {end
                                ? `${formatBangkokTime(start)} - ${formatBangkokTime(end)}`
                                : formatBangkokTime(start)}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleViewDetail(appointment)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                            >
                              รายละเอียด
                            </Button>

                            <PrimaryAction appt={appointment} />
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
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
  );
}
