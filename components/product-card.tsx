"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import type { Product } from "@/lib/types"
import { useCartStore } from "@/lib/cart-store"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

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
    <div
      className={cn(
        "flex flex-col h-full rounded-lg border shadow-sm p-3 leading-tight transition hover:shadow-md"
      )}
    >
      {/* Header */}
      <div className="text-xs text-muted-foreground mb-1">
        รหัสยา {product.code}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-base font-semibold leading-snug mb-0.5 truncate">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground leading-tight line-clamp-2">
          {product.description}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm font-medium">{product.price} บาท</div>
        <Button
          size="icon"
          onClick={handleAddToCart}
          className="h-8 w-8 bg-black hover:bg-black/90"
        >
          <ShoppingCart className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
