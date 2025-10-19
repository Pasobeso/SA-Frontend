"use client"

import { useState } from "react"
import { Search, ShoppingCart } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { products } from "@/lib/data"
import { useCartStore } from "@/lib/cart-store"
import { AddressDialog } from "@/components/address-dialog"
import { CartSheet } from "@/components/cart-sheet"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [cartSheetOpen, setCartSheetOpen] = useState(false)
  const cartItems = useCartStore((state) => state.items)

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.code.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <div className="relative flex-1 p-4 md:p-8">
          {/* Sidebar Toggle (mobile) */}
          <SidebarTrigger />

          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <MobileNav onAddressClick={() => setAddressDialogOpen(true)} />
                <h1 className="text-2xl md:text-3xl font-bold">สั่งซื้อยาให้ตนเอง</h1>
              </div>
              <Button
                className="bg-black hover:bg-black/90"
                size="sm"
                onClick={() => setCartSheetOpen(true)}
              >
                <ShoppingCart className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">ดูรายการยาที่สั่ง</span>
                {totalItems > 0 && (
                  <span className="ml-2 bg-white text-black rounded-full px-2 py-0.5 text-xs font-semibold">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>

            {/* Search */}
            <div className="relative mb-6 md:mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหายา"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </SidebarInset>

      <AddressDialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen} />
      <CartSheet open={cartSheetOpen} onOpenChange={setCartSheetOpen} />
    </SidebarProvider>
  )
}
