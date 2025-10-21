"use client"

import { create } from "zustand"
import { Deliveries } from "@/lib/api/deliveries"

interface AddressStore {
  addresses: Deliveries.DeliveryAddressEntity[]
  loading: boolean
  fetchAddresses: () => Promise<void>
  addAddress: (data: Deliveries.CreateDeliveryAddressReq) => Promise<void>
}

export const useAddressStore = create<AddressStore>((set) => ({
  addresses: [],
  loading: false,

  fetchAddresses: async () => {
    set({ loading: true })
    try {
      const res = await Deliveries.getMyAddresses()
      if (res?.data) set({ addresses: res.data })
    } finally {
      set({ loading: false })
    }
  },

  addAddress: async (data) => {
    try {
      const res = await Deliveries.createAddress(data)
      if (res?.data) {
        const newAddress = res.data
        set((state) => ({
          addresses: [...state.addresses, newAddress],
        }))
      }
    } catch (err) {
      console.error("❌ Failed to add address", err)
    }
  },
}))
