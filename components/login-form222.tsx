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

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  try {
    const res = await fetch(`${baseUrl}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        hospital_number: parseInt(uid, 10),
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data?.token) {
      setError("Invalid Hospital Number or Password");
      return;
    }
    console.log("Login successful", data);
    console.log("Token:", data.token);

    localStorage.setItem("token", data.token);
    window.location.href = "/";
  } catch (err) {
    console.error("Login error:", err);
    setError("Login failed. Please try again.");
  }
};


  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>เข้าสู่ระบบ</CardTitle>
          <CardDescription>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="username">เลขที่โรงพยาบาล (Hospital Number)</Label>
                <Input
                  id="username"
                  type="text"
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
  <a href="/register" className="underline underline-offset-4 text-[#155DFC]">
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