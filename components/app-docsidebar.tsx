"use client"
import { useRouter } from "next/navigation";
import { CalendarClock, Pill, LogOut, History, CalendarRange  } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Auth } from "@/lib/api/auth";
import { toast } from "react-toastify";

export function AppSidebar() {
  const router = useRouter();

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


  const items = [
    {
      title: "นัดหมาย",
      url: "/doctor",
      icon: CalendarClock,
    },
    {
      title: "จัดการการนัดหมาย",
      url: "/doctor/appointment",
      icon: CalendarClock,
    },
    {
      title: "สถานะการสั่งยา",
      url: "/doctor/order",
      icon: History,
    },
  ]

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>สวัสดี</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* ✅ Logout button */}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onLogout}>
                  <LogOut />
                  <span>ออกจากระบบ</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
