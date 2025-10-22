import { client } from "./client"
import { ApiResponse } from "./models"
import { ORDERS_URL } from "./microservices"

export interface CreateCartReq {
  cart_items: { product_id: number; quantity: number }[]
}

export interface CartEntity {
  id: number
  patient_id: number
  created_at: string
  updated_at: string
}

export interface CreateCartRes {
  cart: CartEntity
  cart_items: {
    product_id: number
    quantity: number
  }[]
}

export namespace Carts {
  // 🔹 Create a new cart for the current patient
  export async function createCart(payload: CreateCartReq) {
    const res = await client.post(`${ORDERS_URL}/patients/carts`, payload)
    return res.data as ApiResponse<CreateCartRes>
  }
}
