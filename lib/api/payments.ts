import { client } from "./client"
import { ORDERS_URL } from "./microservices"
import { ApiResponse } from "./models"

export namespace Payments {
  // 1️⃣ Create a payment for a specific order (PromptPay)
export async function createPayment(orderId: number, provider: string = "qr_payment") {
  // ✅ ส่ง body ให้ตรงกับ backend: { provider: "qr_payment" }
  console.log("📡 [createPayment] Sending POST →", `${ORDERS_URL}/patients/orders/${orderId}/payment`)
  console.log("📦 Payload:", { provider })

  const res = await client.post(
    `${ORDERS_URL}/patients/orders/${orderId}/payment`,
    { provider } // ✅ correct body key
  )

  console.log("✅ [createPayment] Response:", res.data)
  return res.data
}


  // 2️⃣ Mock a successful payment (simulate PromptPay confirmation)
  export async function mockPay(paymentId: string) {
    // ✅ ไม่มี body
    const res = await client.post(`${ORDERS_URL}/payments/${paymentId}/mock-pay`)
    return res.data as ApiResponse<{
      payment: {
        id: string
        status: string
      }
      updated_order: {
        id: number
        status: string
      }
    }>
  }
}
