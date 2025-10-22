import { client } from "./client"
import { ApiResponse } from "./models"
import { BOOKINGS_URL } from "./microservices"

export namespace Booking {
  // ===============================
  // ✅ Appointment Model
  // ===============================
  export interface AppointmentEntity {
    id: string
    slot_id: string
    patient_abnormal_symptom: string
    patient_blood_test_status: string
    patient_is_missed_medication: string
    patient_is_overdue_medication: string
    patient_is_partner_hiv_positive: string
  }

  // ===============================
  // ✅ Slot Model
  // ===============================
  export interface SlotEntity {
    id: string
    doctor_id: number
    start_time: string
    end_time: string
    max_appointment_count: number
    current_appointment_count: number
  }

  // ===============================
  //  PATIENT ENDPOINTS
  // ===============================

    export async function addAppointment(data: any) {
    // ✅ force proper JSON serialization
    const res = await client.post(
        "/bookings-service/appointment-ops",
        JSON.stringify(data),
        {
        headers: { "Content-Type": "application/json" },
        transformRequest: [(d) => d], // prevent Axios auto-transform
        }
    )
    return res.data
    }




  // ✅ Delete appointment
  export async function deleteAppointment(appointmentId: string) {
    const res = await client.delete(`${BOOKINGS_URL}/appointment-ops/${appointmentId}`)
    return res.data as ApiResponse<null>
  }

  // ✅ Get patient’s appointments (schedules)
  export async function getMyAppointments(): Promise<
    ApiResponse<{ schedules: AppointmentEntity[] }>
  > {
    const res = await client.get(`${BOOKINGS_URL}/schedule-view/patient`)
    return res.data as ApiResponse<{ schedules: AppointmentEntity[] }>
  }

  // ✅ Get all available slots (for patients to book)
  export async function getAvailableSlots(): Promise<
    ApiResponse<{ slots: SlotEntity[] }>
  > {
    const res = await client.get(`${BOOKINGS_URL}/slot-view`)
    return res.data as ApiResponse<{ slots: SlotEntity[] }>
  }

  // ===============================
  //  DOCTOR ENDPOINTS
  // ===============================

  // ✅ Get doctor’s own slots
  export async function getMySlots(): Promise<ApiResponse<{ slots: SlotEntity[] }>> {
    const res = await client.get(`${BOOKINGS_URL}/slot-view/view-my-slots`)
    return res.data as ApiResponse<{ slots: SlotEntity[] }>
  }

  // ✅ Add new doctor slot
  export async function addSlot(data: {
    start_time: string
    end_time: string
    max_appointment_count: number
  }) {
    const res = await client.post(`${BOOKINGS_URL}/slot-ops`, data)
    return res.data as ApiResponse<null>
  }

  // ✅ Delete doctor slot
  export async function deleteSlot(slot_id: string) {
    const res = await client.delete(`${BOOKINGS_URL}/slot-ops/${slot_id}`)
    return res.data as ApiResponse<null>
  }

  // ✅ Edit doctor slot
  export async function editSlot(slot_id: string, data: Partial<SlotEntity>) {
    const res = await client.patch(`${BOOKINGS_URL}/slot-ops/${slot_id}`, data)
    return res.data as ApiResponse<null>
  }

  // ===============================
  //  APPOINTMENT STATUS UPDATES
  // ===============================

  // ✅ Mark appointment as "Ready"
  export async function markAsReady(appointmentId: string) {
    const res = await client.patch(`${BOOKINGS_URL}/appointment-ledger/to-ready/${appointmentId}`)
    return res.data as ApiResponse<null>
  }

  // ✅ Mark appointment as "Waiting for Prescription"
  export async function markAsWaitingForPrescription(appointmentId: string) {
    const res = await client.patch(
      `${BOOKINGS_URL}/appointment-ledger/to-waiting-for-prescription/${appointmentId}`
    )
    return res.data as ApiResponse<null>
  }

  // ✅ Mark appointment as "Completed"
  export async function markAsCompleted(appointmentId: string) {
    const res = await client.patch(`${BOOKINGS_URL}/appointment-ledger/to-completed/${appointmentId}`)
    return res.data as ApiResponse<null>
  }

  // ✅ Get doctor's scheduled appointments
export async function getDoctorAppointments(): Promise<
  ApiResponse<{ schedules: AppointmentEntity[] }>
> {
  const res = await client.get(`${BOOKINGS_URL}/schedule-view/doctor`)
  return res.data as ApiResponse<{ schedules: AppointmentEntity[] }>
}
}
