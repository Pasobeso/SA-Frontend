"use client"

import type React from "react"

import { Package, Send, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  onClick?: () => void
}

interface SidebarNavProps {
  onAddressClick?: () => void
}

export function SidebarNav({ onAddressClick }: SidebarNavProps) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    {
      title: "จัดการรับยาคนไข้",
      href: "/",
      icon: Package,
    },
    {
      title: "ส่งซื้อยา",
      icon: Send,
      onClick: onAddressClick,
    },
    {
      title: "ออกจากระบบ",
      href: "/logout",
      icon: LogOut,
    },
  ]

  return (
    <nav className="w-52 border-r bg-background p-4 space-y-2">
      <div className="mb-8">
        <h2 className="text-lg font-bold">ธราดี คุณร่วมรุ่ง พยาบาล</h2>
      </div>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = item.href ? pathname === item.href : false

        if (item.onClick) {
          return (
            <button
              key={item.title}
              onClick={item.onClick}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors w-full",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </button>
          )
        }

        return (
          <Link
            key={item.href}
            href={item.href!}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}
