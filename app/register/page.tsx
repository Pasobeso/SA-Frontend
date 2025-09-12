import type { Metadata } from "next";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = {
  title: "ลงทะเบียน | SA Hospital",
  description: "สมัครสมาชิกเพื่อใช้งานระบบ SA Hospital",
};

export default function RegisterPage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </main>
  );
}
