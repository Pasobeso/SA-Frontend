"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ShoppingCart } from "lucide-react"
import type { Product } from "@/lib/types"
import { useCartStore } from "@/lib/cart-store"
import { useToast } from "@/components/ui/use-toast"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addToCart)
  const { toast } = useToast()

  const handleAddToCart = () => {
    addToCart(product)
    toast({
      title: "เพิ่มลงตะกร้าแล้ว",
      description: `${product.name} ถูกเพิ่มลงในตะกร้าสินค้า`,
    })
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="text-sm text-muted-foreground">รหัสยา {product.code}</div>
      </CardHeader>
      <CardContent className="flex-1">
        <h3 className="text-xl font-bold mb-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground">{product.description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-4">
        <div className="text-lg font-semibold">{product.price} บาท</div>
        <Button size="icon" onClick={handleAddToCart} className="bg-black hover:bg-black/90">
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
