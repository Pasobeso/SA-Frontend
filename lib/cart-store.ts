"use client"
import { create } from "zustand"
import type { Cart, Product, Address } from "./types"
import { defaultAddresses } from "./data"

interface CartStore {
  items: { product: Product; quantity: number }[]
  deliveryMethod: "pickup" | "delivery"
  selectedAddressId: string | null
  addresses: Address[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  setDeliveryMethod: (method: "pickup" | "delivery") => void
  setSelectedAddress: (addressId: string | null) => void
  addAddress: (address: string) => void
  updateAddress: (id: string, address: string) => void
  deleteAddress: (id: string) => void
  getTotalPrice: () => number
  getVAT: () => number
  clearCart: () => void
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  deliveryMethod: "delivery",
  selectedAddressId: null,
  addresses: defaultAddresses,

  addToCart: (product) => {
    const items = get().items
    const existing = items.find((i) => i.product.id === product.id)
    if (existing) {
      set({
        items: items.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      })
    } else {
      set({ items: [...items, { product, quantity: 1 }] })
    }
  },

  removeFromCart: (id) => {
    set({ items: get().items.filter((i) => i.product.id !== id) })
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) get().removeFromCart(id)
    else
      set({
        items: get().items.map((i) =>
          i.product.id === id ? { ...i, quantity } : i
        ),
      })
  },

  setDeliveryMethod: (method) => set({ deliveryMethod: method }),

  setSelectedAddress: (addressId) => set({ selectedAddressId: addressId }),

  addAddress: (address) => {
    const newAddr: Address = { id: Date.now().toString(), address }
    set({ addresses: [...get().addresses, newAddr] })
  },

  updateAddress: (id, address) => {
    set({
      addresses: get().addresses.map((a) =>
        a.id === id ? { ...a, address } : a
      ),
    })
  },

  deleteAddress: (id) => {
    set({ addresses: get().addresses.filter((a) => a.id !== id) })
  },

  getTotalPrice: () => {
    const subtotal = get().items.reduce(
      (t, i) => t + i.product.price * i.quantity,
      0
    )
    return subtotal + get().getVAT()
  },

  getVAT: () => {
    const subtotal = get().items.reduce(
      (t, i) => t + i.product.price * i.quantity,
      0
    )
    return Math.round(subtotal * 0.07)
  },

  clearCart: () => set({ items: [], selectedAddressId: null }),
}))
