"use client"

import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useCartStore } from "@/lib/cart-store"
import { AddressDialog } from "@/components/address-dialog"
import { useToast } from "@/hooks/use-toast"

interface CartSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { toast } = useToast()
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)

  const items = useCartStore((state) => state.items)
  const deliveryMethod = useCartStore((state) => state.deliveryMethod)
  const selectedAddressId = useCartStore((state) => state.selectedAddressId)
  const addresses = useCartStore((state) => state.addresses)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const setDeliveryMethod = useCartStore((state) => state.setDeliveryMethod)
  const setSelectedAddress = useCartStore((state) => state.setSelectedAddress)
  const getTotalPrice = useCartStore((state) => state.getTotalPrice)
  const getVAT = useCartStore((state) => state.getVAT)
  const clearCart = useCartStore((state) => state.clearCart)

  const handleCheckout = () => {
    if (items.length === 0) {
      toast({
        title: "ตะกร้าสินค้าว่าง",
        description: "กรุณาเพิ่มสินค้าลงในตะกร้าก่อนสั่งซื้อ",
        variant: "destructive",
      })
      return
    }

    if (deliveryMethod === "delivery" && !selectedAddressId) {
      toast({
        title: "กรุณาเลือกที่อยู่จัดส่ง",
        description: "กรุณาเลือกที่อยู่สำหรับการจัดส่ง",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "สั่งซื้อสำเร็จ",
      description: "คำสั่งซื้อของคุณได้รับการบันทึกแล้ว",
    })
    clearCart()
    onOpenChange(false)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-xl md:text-2xl">รายการยาที่สั่ง</SheetTitle>
          </SheetHeader>

          {items.length === 0 ? (
            <div className="flex items-center justify-center h-[50vh]">
              <p className="text-muted-foreground">ไม่มีสินค้าในตะกร้า</p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {items.map((item) => (
                <div key={item.product.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">รหัสยา {item.product.code}</div>
                      <h3 className="font-bold mb-0.5">{item.product.name}</h3>
                      <p className="text-xs text-muted-foreground">{item.product.nameEn}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{item.product.price} บาท</div>
                    <div className="flex items-center gap-2 border rounded-lg px-2 py-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              <div className="border-t pt-4 space-y-4">
                <div>
                  <h3 className="font-semibold mb-3 text-sm">เลือกวิธีการจัดส่ง</h3>
                  <RadioGroup
                    value={deliveryMethod}
                    onValueChange={(value: "pickup" | "delivery") => setDeliveryMethod(value)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="text-sm">
                        รับที่โรงพยาบาล
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="delivery" id="delivery" />
                      <Label htmlFor="delivery" className="text-sm">
                        จัดส่งพัสดุ
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {deliveryMethod === "delivery" && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm">ที่อยู่จัดส่ง</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setAddressDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Select value={selectedAddressId || ""} onValueChange={setSelectedAddress}>
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="เลือกที่อยู่" />
                      </SelectTrigger>
                      <SelectContent>
                        {addresses.map((address) => (
                          <SelectItem key={address.id} value={address.id} className="text-sm">
                            {address.address}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>VAT 7%</span>
                    <span>{getVAT()} บาท</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-sm">ราคาที่ผู้ป่วยต้องจ่ายระ</span>
                    <span>{getTotalPrice()} บาท</span>
                  </div>
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700" size="lg" onClick={handleCheckout}>
                  สั่งยา
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AddressDialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen} />
    </>
  )
}
