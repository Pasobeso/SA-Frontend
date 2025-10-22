// lib/api/payments.ts
import { client } from "./client"
import { ORDERS_URL } from "./microservices"
import { ApiResponse } from "./models"

export namespace Payments {
  // 1️⃣ Create a payment for a specific order (PromptPay)
  export async function createPayment(orderId: number, provider: string = "qr_payment") {

    const res = await client.post(
      `${ORDERS_URL}/patients/orders/${orderId}/payment`,
      { provider }
    )
    return res.data as ApiResponse<{
      payment: { id: string }
      updated_order: any
    }>
  }

  // 2️⃣ Mock a successful payment (simulate PromptPay confirmation)
  export async function mockPay(paymentId: string) {
    const res = await client.post(`${ORDERS_URL}/payments/${paymentId}/mock-pay`)
    return res.data as ApiResponse<any>
  }
}
