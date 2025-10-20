"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import useMe from "@/hooks/auth/useMe";
import { localizeRole } from "@/lib/localization";
import { Auth } from "@/lib/api/auth";
import { toast } from "react-toastify";

export default function Home() {
  const router = useRouter();
  const { me, isLoggedIn, refetch: refetchMe } = useMe();
  const user = me?.me;
  const claims = me?.claims;

  // Milliseconds since epoch for iat/exp, if present
  const iatMs = claims?.iat ? claims.iat * 1000 : undefined;
  const expMs = claims?.exp ? claims.exp * 1000 : undefined;

  // Ticking "now" so the countdown updates live
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Elapsed since session start, Remaining until expiry
  const { elapsedMs, remainingMs, expired } = useMemo(() => {
    const elapsed = iatMs ? Math.max(0, now - iatMs) : undefined;
    const remaining = expMs ? Math.max(0, expMs - now) : undefined;
    const isExpired = expMs ? now >= expMs : false;
    return { elapsedMs: elapsed, remainingMs: remaining, expired: isExpired };
  }, [iatMs, expMs, now]);

  function formatDuration(ms?: number) {
    if (ms == null) return "-";
    const s = Math.floor(ms / 1000);
    const days = Math.floor(s / 86400);
    const hours = Math.floor((s % 86400) / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const seconds = s % 60;
    const parts: string[] = [];
    if (days) parts.push(`${days} วัน`);
    if (hours) parts.push(`${hours} ชม.`);
    if (minutes) parts.push(`${minutes} นาที`);
    parts.push(`${seconds} วินาที`);
    return parts.join(" ");
  }

  async function onLogout() {
    try {
      await Auth.logout();
      toast.success("ออกจากระบบสำเร็จ");
    } catch (_) {
      toast.error("เกิดข้อผิดพลาดในการออกจากระบบ");
    } finally {
      // Back to login
      router.push("/login");
      router.refresh();
    }
  }

  async function onRefresh() {
    try {
      if (claims?.role === "Patient") {
        await Auth.refreshPatient();
      } else if (claims?.role === "Doctor") {
        await Auth.refreshDoctor();
      } else {
        throw new Error(`Unknown role: ${claims?.role}`);
      }
      toast.success("ต่ออายุสำเร็จ");
    } catch (_) {
      toast.error("เกิดข้อผิดพลาดในการต่ออายุ");
    } finally {
      router.refresh();
      refetchMe();
    }
  }

  useEffect(() => {
    if (isLoggedIn === false) {
      router.push("/login");
      router.refresh();
    }
  }, [isLoggedIn]);

  return (
    <div className="font-sans min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-md space-y-4 p-6 rounded-2xl shadow-sm border">
        <div className="text-xl font-semibold text-gray-900">
          คุณได้ลงชื่อเข้าใช้แล้ว
        </div>

        <div className="grid grid-cols-3 gap-y-2 text-sm">
          <div className="text-gray-500">เลขที่โรงพยาบาล</div>
          <div className="col-span-2 font-medium">{user?.id ?? "-"}</div>

          <div className="text-gray-500">ชื่อผู้ใช้</div>
          <div className="col-span-2 font-medium">
            {user ? `${user.first_name} ${user.last_name}` : "-"}
          </div>

          <div className="text-gray-500">ประเภทผู้ใช้</div>
          <div className="col-span-2 font-medium">
            {claims ? `${localizeRole(claims.role)}` : "-"}
          </div>

          <div className="text-gray-500">เซสชันเริ่มเมื่อ</div>
          <div className="col-span-2">
            <div className="font-medium">
              {iatMs ? new Date(iatMs).toLocaleString("th-TH") : "-"}
            </div>
            <div className="text-xs text-gray-500">
              ผ่านมาแล้ว: {formatDuration(elapsedMs)}
            </div>
          </div>

          <div className="text-gray-500">เซสชันจะสิ้นสุดเมื่อ</div>
          <div className="col-span-2">
            <div className="font-medium">
              {expMs ? new Date(expMs).toLocaleString("th-TH") : "-"}
            </div>
            <div
              className={`text-xs ${
                expired ? "text-red-600" : "text-gray-500"
              }`}
            >
              {expired
                ? `หมดอายุแล้ว: ${formatDuration(now - (expMs ?? now))}`
                : `เหลืออีก: ${formatDuration(remainingMs)}`}
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-1">
          <Button className="w-full " onClick={onRefresh}>
            ต่ออายุเซสชัน
          </Button>
          <Button className="w-full" variant={"destructive"} onClick={onLogout}>
            ออกจากระบบ
          </Button>
        </div>
      </div>
    </div>
  );
}