"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { AppointmentBookingWizard } from "@/components/appointment-booking-wizard";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Booking } from "@/lib/api/booking";
import { useToast } from "@/hooks/use-toast";

export default function AppointmentsPage() {
  const { toast } = useToast();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ---- Time helpers: parse "naive UTC" -> Date(UTC) then format in Asia/Bangkok ----
  const parseUtcNaive = (input: string) => {
    if (!input) return new Date(NaN);
    const s = input.replace(" ", "T"); // support "YYYY-MM-DD HH:mm:ss"
    const hasTZ = /[zZ]|[+\-]\d{2}:\d{2}$/.test(s);
    return new Date(hasTZ ? s : `${s}Z`);
  };

  const formatBangkokDate = (d: Date) =>
    new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      weekday: "short",
      day: "2-digit",
      month: "short",
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
      .replace(/\./g, ":"); // เผื่อบางเบราว์เซอร์ใช้จุดเป็นตัวคั่น

  // ✅ Load appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await Booking.getMyAppointments();
        if (!res.data) throw new Error("No data returned");
        setAppointments(res.data.schedules);
      } catch (err) {
        toast({
          title: "ไม่สามารถโหลดข้อมูลการนัดหมายได้",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // ✅ Add new appointment
  const handleNewAppointment = async (appointmentData: any) => {
    try {
      await Booking.addAppointment({
        slot_id: appointmentData.slot_id,
        patient_abnormal_symptom: appointmentData.abnormal_symptom,
        patient_blood_test_status: appointmentData.blood_test_status,
        patient_is_missed_medication: appointmentData.is_missed_med,
        patient_is_overdue_medication: appointmentData.is_overdue,
        patient_is_partner_hiv_positive: appointmentData.is_partner_positive,
      });
      toast({ title: "เพิ่มการนัดหมายสำเร็จ" });
      setIsBookingOpen(false);
      const res = await Booking.getMyAppointments();
      setAppointments(res.data?.schedules ?? []);
    } catch (err) {
      toast({ title: "ไม่สามารถเพิ่มการนัดหมายได้", variant: "destructive" });
    }
  };

  // ✅ Cancel appointment
  const handleCancel = async (appointmentId: string) => {
    try {
      await Booking.deleteAppointment(appointmentId);
      toast({ title: "ยกเลิกการนัดหมายสำเร็จ" });
      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
    } catch {
      toast({ title: "ไม่สามารถยกเลิกได้", variant: "destructive" });
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="relative flex-1 p-4 md:p-8">
          <SidebarTrigger />
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
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-gray-600 mb-1">
                              หมายเลขนัดหมาย {appointment.id}
                            </p>

                            {/* วันที่แบบไทย */}
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {formatBangkokDate(start)}
                            </h3>

                            {/* เวลาแบบไทย (รองรับมี end_time/ไม่มี) */}
                            <p className="text-xl font-bold text-gray-900 mb-2">
                              {end
                                ? `${formatBangkokTime(start)} - ${formatBangkokTime(end)}`
                                : formatBangkokTime(start)}
                            </p>

                            <p className="text-sm text-gray-600 mb-1">
                              สถานะ: {appointment.status}
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                              onClick={() => handleCancel(appointment.id)}
                            >
                              ยกเลิก
                            </Button>
                            <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
                              รายละเอียด
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
            </div>
          )}

          {/* Booking Wizard Modal */}
          <AppointmentBookingWizard
            isOpen={isBookingOpen}
            onClose={() => setIsBookingOpen(false)}
            onComplete={handleNewAppointment}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
