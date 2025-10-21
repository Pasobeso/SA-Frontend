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
      title: "จัดการการนัดหมาย",
      url: "/docmain",
      icon: CalendarRange,
    },
    {
      title: "จัดการเวลานัดหมาย",
      url: "/appointment",
      icon: CalendarClock,
    },
        {
      title: "History",
      url: "/history",
      icon: History,
    },
    {
      title: "สั่งซื้อยา",
      url: "/med",
      icon: Pill,
    },
  ]

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>สวัสดีคุณ</SidebarGroupLabel>
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
