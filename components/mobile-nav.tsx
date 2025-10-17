"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { SidebarNav } from "./sidebar-nav"

interface MobileNavProps {
  onAddressClick?: () => void
}

export function MobileNav({ onAddressClick }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64">
        <SidebarNav
          onAddressClick={() => {
            onAddressClick?.()
            setOpen(false)
          }}
        />
      </SheetContent>
    </Sheet>
  )
}
