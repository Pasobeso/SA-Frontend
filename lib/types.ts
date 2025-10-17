export interface Product {
  id: string
  code: string
  name: string
  nameEn: string
  description: string
  price: number
  inStock: boolean
}

export interface Address {
  id: string
  address: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Cart {
  items: CartItem[]
  deliveryMethod: "pickup" | "delivery"
  selectedAddressId: string | null
}
