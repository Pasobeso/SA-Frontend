"use client";

import { useState } from "react";
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
import { Auth } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { ApiResponse } from "@/lib/api/models";
import { toast } from "react-toastify";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  const [loginMode, setLoginMode] = useState("patient");
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      let res;

      if (loginMode === "patient") {
        res = await Auth.loginPatient({
          hospital_number: Number(uid),
          password,
        });
        toast.success("เข้าสู่ระบบสำเร็จ");
        router.push("/patient");
      } else if (loginMode == "doctor") {
        res = await Auth.loginDoctor({
          hospital_number: Number(uid),
          password,
        });
        toast.success("เข้าสู่ระบบสำเร็จ");
        router.push("/doctor");
      } else {
        throw new Error(`Unknown login mode: ${loginMode}`);
      }

    } catch (err) {
      if (err instanceof AxiosError) {
        const message = err.response?.data?.["message"];
        if (message == "Invalid password") {
        }

        switch (message) {
          case "Invalid password":
            setError("รหัสผ่านไม่ถูกต้อง");
            break;
          default:
            setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        }
      }
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>เข้าสู่ระบบ</CardTitle>
          <CardDescription></CardDescription>
        </CardHeader>

        <CardContent>
          <div className="text-sm mb-1">เข้าสู่ระบบในฐานะ</div>

          <Tabs
            defaultValue="patient"
            value={loginMode}
            onValueChange={(value) => setLoginMode(value)}
          >
            <TabsList className="w-full mb-5">
              <TabsTrigger value="patient">ผู้ป่วย</TabsTrigger>
              <TabsTrigger value="doctor">แพทย์</TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username">
                  เลขที่โรงพยาบาล (Hospital Number)
                </Label>
                <Input
                  id="username"
                  type="number"
                  placeholder="กดตรงนี้เพื่อใส่เลขที่โรงพยาบาล"
                  required
                  value={uid}
                  onChange={(e) => {
                    const input = e.target.value.trim();
                    setUid(input);
                  }}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="กดตรงนี้เพื่อใส่รหัสผ่าน"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full">
                เข้าสู่ระบบ
              </Button>
              <div className="text-left text-sm">
                <span className="text-[#62748E]">ยังไม่มีบัญชี? </span>
                <a
                  href="/register"
                  className="underline underline-offset-4 text-[#155DFC]"
                >
                  ลงทะเบียนที่นี่
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
