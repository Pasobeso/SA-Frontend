import { client } from "./client";
import { ApiResponse } from "./models";
import { DELIVERIES_URL } from "./microservices";

export namespace Deliveries {
  export interface DeliveryAddressEntity {
    id: number;
    patient_id: number;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    phone_number?: string | null;
    recipient_name?: string | null;
  }

  export interface CreateDeliveryAddressReq {
    recipient_name: string;
    phone_number: string;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  }

  // ✅ Get all addresses for current user
  export async function getMyAddresses() {
    const res = await client.get(`${DELIVERIES_URL}/patients/deliveries/my-delivery-addresses`);
    return res.data as ApiResponse<DeliveryAddressEntity[]>;
  }

  // ✅ Create a new address
  export async function createAddress(data: CreateDeliveryAddressReq) {
    const res = await client.post(`${DELIVERIES_URL}/patients/deliveries`, data);
    return res.data as ApiResponse<DeliveryAddressEntity>;
  }

  export async function deleteAddress(id: number) {
    const res = await client.delete(`${DELIVERIES_URL}/patients/deliveries/${id}`);
    return res.data as ApiResponse<DeliveryAddressEntity>;
  }

  export async function updateAddress(id: number, data: Partial<CreateDeliveryAddressReq>) {
    const res = await client.patch(`${DELIVERIES_URL}/patients/deliveries/${id}`, data);
    return res.data as ApiResponse<DeliveryAddressEntity>;
  }

  // ✅ อัปเดตสถานะการจัดส่ง
// ✅ อัปเดตสถานะการจัดส่ง (แก้ path ให้ถูก)
// ✅ อัปเดตสถานะการจัดส่ง (ใช้ path ที่ถูกต้อง)
// ✅ PATCH /deliveries/{id}/status
export async function updateStatus(deliveryId: string | number, status: string) {
  console.log("🚀 Updating delivery:", `${DELIVERIES_URL}/deliveries/${deliveryId}/status`, "status:", status)

  const body = {
    description: "-",
    status,
  }

  const res = await client.patch(`${DELIVERIES_URL}/deliveries/${deliveryId}/status`, body)
  console.log("✅ Delivery update response:", res.data)

  return res.data
}

// ✅ GET /deliveries
export async function getAllDeliveries() {
  console.log("📡 Fetching all deliveries from:", `${DELIVERIES_URL}/deliveries`)
  const res = await client.get(`${DELIVERIES_URL}/deliveries`)
  return res.data
}



}
