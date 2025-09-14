"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users } from "@/lib/api/users";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Dialog, DialogContent } from "./ui/dialog";
import ShowHnDialog from "./show-hn-dialog";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [citizenId, setCitizenId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [hospitalNumber, setHospitalNumber] = useState<number | undefined>(
    undefined
  );
  const [showHnDialogOpen, setShowHnDialogOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    try {
      setLoading(true);

      const res = await Users.register({
        citizen_id: citizenId,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        password: password,
      });

      // router.push(`/login`);

      setHospitalNumber(res.data?.hospital_number);
      setShowHnDialogOpen(true);
      toast.success("ลงทะเบียนสำเร็จ");
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setLoading(false);
    }
  };

  function onCloseShowHnDialog() {
    router.push("/login");
    router.refresh();
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>ลงทะเบียน</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>

        <ShowHnDialog
          hospitalNumber={hospitalNumber ?? 0}
          open={showHnDialogOpen}
          onClose={onCloseShowHnDialog}
        ></ShowHnDialog>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="citizenId">เลขบัตรประชาชน</Label>
                <Input
                  id="citizenId"
                  placeholder="ตัวอย่าง 1-1111-11111-11-1"
                  value={citizenId}
                  onChange={(e) => setCitizenId(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="firstName">ชื่อ</Label>
                <Input
                  id="firstName"
                  placeholder="ตัวอย่าง ร่อนเร่"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="lastName">นามสกุล</Label>
                <Input
                  id="lastName"
                  placeholder="ตัวอย่าง เพนจร"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="phoneNumber">เบอร์โทรศัพท์</Label>
                <Input
                  id="phoneNumber"
                  placeholder="ตัวอย่าง 0XX-XXXX-XXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="กรอกรหัสผ่าน"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="ยืนยันรหัสผ่าน"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "กำลังลงทะเบียน..." : "ลงทะเบียน"}
              </Button>

              <div className="text-left text-sm">
                <span className="text-[#62748E]">มีบัญชีอยู่แล้ว? </span>
                <a
                  href="/login"
                  className="underline underline-offset-4 text-[#155DFC]"
                >
                  เข้าสู่ระบบที่นี่
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
