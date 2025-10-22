import { client } from "./client"
import { ApiResponse } from "./models"
import { ORDERS_URL } from "./microservices"

export interface OrderEntity {
  id: number
  cart_id: number
  patient_id: number
  status: string
  order_type: string
  delivery_address?: any
  created_at: string
  updated_at: string
}

export interface CartItemEntity {
  product_id: number
  quantity: number
}

export interface GetOrderRes {
  order: OrderEntity
  order_items: CartItemEntity[]
  total_price: number
}

export interface PaymentEntity {
  id: string
  order_id: number
  amount: number
  status: string
  provider: string
  created_at: string
  updated_at: string
}

export namespace Orders {
  // 🔹 Fetch all orders belonging to the authenticated patient
  export async function getMyOrders() {
    const res = await client.get(`${ORDERS_URL}/patients/orders/my-orders`)
    return res.data as ApiResponse<GetOrderRes[]>
  }

  // 🔹 Create a new payment for a given order
  export async function createPayment(orderId: number, provider: string) {
    const res = await client.post(
      `${ORDERS_URL}/patients/orders/${orderId}/payment`,
      { provider }
    )
    return res.data as ApiResponse<{
      payment: PaymentEntity
      updated_order: OrderEntity
    }>
  }

  // 🔹 Mock pay (for testing)
  export async function mockPay(paymentId: string) {
    const res = await client.post(`${ORDERS_URL}/payments/${paymentId}/mock-pay`)
    return res.data as ApiResponse<{
      updated_payment: PaymentEntity
      updated_order: OrderEntity
    }>
  }

  export async function createOrder(cart_id: number, delivery_address_id: number) {
  const payload = { cart_id, delivery_address_id }
  const res = await client.post(`${ORDERS_URL}/patients/orders`, payload)
  return res.data as ApiResponse<OrderEntity>
}

}
