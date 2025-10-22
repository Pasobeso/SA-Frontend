"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Booking } from "@/lib/api/booking";
import { toast } from "react-toastify";

// Optional: type to make parsing safer no matter your API field names

type ApiSlot = {
  start_time?: string;
  end_time?: string;
  start?: string;
  end?: string;
  startTime?: string;
  endTime?: string;
};

export function SlotCreationDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const today = new Date();

  // ----------------------
  // Local state
  // ----------------------
  const [selectedBlocks, setSelectedBlocks] = useState<Record<string, number>>(
    {},
  );
  const [saving, setSaving] = useState(false);

  // date selection
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() =>
    formatDateISO(today),
  );
  const [existingForDate, setExistingForDate] = useState<Set<string>>(
    new Set(),
  );
  const [loadingExisting, setLoadingExisting] = useState(false);

  const timeBlocks = [
    { start: "08:00", end: "09:00" },
    { start: "09:00", end: "10:00" },
    { start: "10:00", end: "11:00" },
    { start: "11:00", end: "12:00" },
    { start: "13:00", end: "14:00" },
    { start: "14:00", end: "15:00" },
    { start: "15:00", end: "16:00" },
    { start: "16:00", end: "17:00" },
  ];

  const progress = 100;

  const toggleBlock = (label: string) => {
    setSelectedBlocks((prev) => {
      const newState = { ...prev };
      if (label in newState) delete newState[label];
      else newState[label] = 10;
      return newState;
    });
  };

  const updateCount = (label: string, value: number) => {
    setSelectedBlocks((prev) => ({ ...prev, [label]: value }));
  };

  const THAI_OFFSET_MINUTES = 7 * 60;

  // ✅ Convert from Thai local time (UTC+7) to UTC **naive** string (no Z)
  const makeUtcNaiveFromThai = (date: Date, time: string) => {
    const [h, m] = time.split(":").map(Number);
    const utcMs =
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), h, m, 0) -
      THAI_OFFSET_MINUTES * 60 * 1000;
    const d = new Date(utcMs);
    const yyyy = d.getUTCFullYear();
    const MM = String(d.getUTCMonth() + 1).padStart(2, "0");
    const DD = String(d.getUTCDate()).padStart(2, "0");
    const HH = String(d.getUTCHours()).padStart(2, "0");
    const mm = String(d.getUTCMinutes()).padStart(2, "0");
    return `${yyyy}-${MM}-${DD}T${HH}:${mm}:00`;
  };

  // Helpers to read UTC-naive from server as Thai local for UI filtering/labels
  function utcNaiveToThaiYMD(input: string) {
    const d = new Date(input.endsWith("Z") ? input : input + "Z");
    const thaiMs = d.getTime() + THAI_OFFSET_MINUTES * 60 * 1000;
    const t = new Date(thaiMs);
    const yyyy = t.getUTCFullYear();
    const MM = String(t.getUTCMonth() + 1).padStart(2, "0");
    const DD = String(t.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${MM}-${DD}`;
  }
  function utcNaiveToThaiHHmm(input: string) {
    const d = new Date(input.endsWith("Z") ? input : input + "Z");
    const thaiMs = d.getTime() + THAI_OFFSET_MINUTES * 60 * 1000;
    const t = new Date(thaiMs);
    const HH = String(t.getUTCHours()).padStart(2, "0");
    const mm = String(t.getUTCMinutes()).padStart(2, "0");
    return `${HH}:${mm}`;
  }

  // ----------------------
  // Date options (simple dropdown for the next 14 days)
  // ----------------------
  const dateOptions = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return {
        value: formatDateISO(d),
        label: d.toLocaleDateString("th-TH", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };
    });
  }, []);

  // ----------------------
  // Fetch existing slots for the selected date
  // ----------------------
  useEffect(() => {
    if (!open || !selectedDateStr) return;
    (async () => {
      setLoadingExisting(true);
      try {
        // Adjust to your API. Prefer Booking.listSlots({ date }) if it exists.
        const res: any = await Booking.getMySlots();
        const raw =
          (res as any)?.data?.slots ??
          (res as any)?.slots ??
          (res as any)?.data ??
          res;
        const items: ApiSlot[] = Array.isArray(raw) ? raw : (raw?.slots ?? []);
        const taken = new Set<string>();
        for (const s of items) {
          const st = s.start_time ?? s.start ?? s.startTime;
          const et = s.end_time ?? s.end ?? s.endTime;
          if (!st || !et) continue;
          const sameDay = utcNaiveToThaiYMD(String(st)) === selectedDateStr;
          if (!sameDay) continue;
          const hhmmStart = utcNaiveToThaiHHmm(String(st));
          const hhmmEnd = utcNaiveToThaiHHmm(String(et));
          if (hhmmStart && hhmmEnd) taken.add(`${hhmmStart}-${hhmmEnd}`);
        }
        setExistingForDate(taken);

        // prune any selected blocks that are already taken on the chosen date
        setSelectedBlocks((prev) => {
          const next = { ...prev };
          Object.keys(next).forEach((k) => {
            if (taken.has(k)) delete next[k];
          });
          return next;
        });
      } catch (e) {
        console.error("❌ Error fetching existing slots:", e);
        toast.error("ดึงข้อมูลช่วงเวลาที่มีอยู่ไม่สำเร็จ");
        setExistingForDate(new Set());
      } finally {
        setLoadingExisting(false);
      }
    })();
  }, [open, selectedDateStr]);

  const handleCreate = async () => {
    const entries = Object.entries(selectedBlocks);
    if (entries.length === 0) {
      toast.error("กรุณาเลือกช่วงเวลาอย่างน้อยหนึ่งช่วง");
      return;
    }

    // build Date from selected date string
    const [yy, mm, dd] = selectedDateStr.split("-").map(Number);
    const date = new Date(yy, (mm || 1) - 1, dd);

    setSaving(true);
    try {
      await Promise.all(
        entries.map(async ([label, count]) => {
          const [start, end] = label.split("-");
          const start_time = makeUtcNaiveFromThai(date, start);
          const end_time = makeUtcNaiveFromThai(date, end);
          const payload = {
            start_time,
            end_time,
            max_appointment_count: count || 10,
          };

          const res = await Booking.addSlot(payload);
          return res;
        }),
      );

      toast.success("สร้างช่วงเวลาเรียบร้อย");
      onOpenChange(false);
      onCreated();
      setSelectedBlocks({});
    } catch (err) {
      console.error("❌ Error creating slots:", err);
      toast.error("ไม่สามารถสร้างช่วงเวลาได้");
    } finally {
      setSaving(false);
    }
  };

  const selectedDatePretty = useMemo(() => {
    try {
      const [y, m, d] = selectedDateStr.split("-").map(Number);
      const dt = new Date(y, (m || 1) - 1, d);
      return dt.toLocaleDateString("th-TH", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return selectedDateStr;
    }
  }, [selectedDateStr]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 rounded-2xl">
        <DialogHeader>
          <DialogTitle>สร้างช่วงเวลานัดหมาย</DialogTitle>
          <DialogDescription>
            เลือกวันที่ ช่วงเวลา และจำนวนโควตาที่ต้องการเปิดให้คนไข้นัด
          </DialogDescription>
        </DialogHeader>

        <Progress value={progress} className="h-2 bg-gray-200 mb-4" />

        {/* Date selector (simple dropdown) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            เลือกวัน
          </label>
          <select
            value={selectedDateStr}
            onChange={(e) => setSelectedDateStr(e.target.value)}
            className="w-full border rounded-lg p-2 bg-white"
          >
            {dateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            ช่วงเวลาที่มีอยู่แล้วในวัน {selectedDatePretty}{" "}
            จะถูกปิดให้เลือกอัตโนมัติ
          </p>
        </div>

        <h3 className="font-medium text-gray-700 mb-3">
          เลือกช่วงเวลาและจำนวนคน (ไม่กรอก = 10)
        </h3>

        {loadingExisting ? (
          <div className="text-sm text-gray-600 mb-3">
            กำลังโหลดช่วงเวลาที่มีอยู่แล้ว…
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-1">
          {timeBlocks.map((b) => {
            const label = `${b.start}-${b.end}`;
            const selected = label in selectedBlocks;
            const alreadyHas = existingForDate.has(label);
            const disabled = alreadyHas || saving || loadingExisting;
            return (
              <div
                key={label}
                className="border rounded-lg p-3 flex flex-col items-center"
              >
                <Button
                  type="button"
                  variant={selected ? "default" : "outline"}
                  disabled={disabled}
                  className={`w-full py-3 text-base font-medium ${
                    selected
                      ? "bg-green-600 text-white"
                      : alreadyHas
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:bg-green-50"
                  }`}
                  onClick={() => toggleBlock(label)}
                  title={alreadyHas ? "ช่วงเวลานี้ถูกสร้างไว้แล้ว" : undefined}
                >
                  {b.start}-{b.end}
                  {alreadyHas && <span className="ml-2 text-xs">(มีแล้ว)</span>}
                </Button>
                {selected && !alreadyHas && (
                  <Input
                    type="number"
                    min={1}
                    value={selectedBlocks[label]}
                    onChange={(e) =>
                      updateCount(label, Number(e.target.value) || 10)
                    }
                    className="mt-2 w-24 text-center"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleCreate}
            disabled={saving || Object.keys(selectedBlocks).length === 0}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
          >
            {saving ? "กำลังบันทึก..." : "ตกลง"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ----------------------
// Helpers
// ----------------------
function formatDateISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
