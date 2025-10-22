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

export interface CartItemEntity {
  id?: number
  cart_id?: number
  product_id: number
  quantity: number
  created_at?: string
  updated_at?: string
}

export interface CreateCartRes {
  cart: CartEntity
  cart_items: CartItemEntity[]
}

export interface GetCartRes {
  cart: CartEntity
  cart_items: (CartItemEntity & {
    product?: {
      id: number
      name: string
      price: number
      image_url?: string
    }
  })[]
}

export namespace Carts {
  // 🔹 Create a new cart for the current patient
  export async function createCart(payload: CreateCartReq) {
    const res = await client.post(`${ORDERS_URL}/patients/carts`, payload)
    return res.data as ApiResponse<CreateCartRes>
  }

  // 🔹 Get a specific cart by ID (belonging to the authenticated patient)
  export async function getCart(cartId: number) {
    const res = await client.get(`${ORDERS_URL}/patients/carts/${cartId}`)
    return res.data as ApiResponse<GetCartRes>
  }
}
