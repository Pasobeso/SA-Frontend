import { client } from "./client"
import { USERS_URL } from "./microservices"
import { ApiResponse } from "./models"

export namespace Users {
  // ===============================
  // ✅ User Model
  // ===============================
  export interface UserEntity {
    id: number
    citizen_id: string
    first_name: string
    last_name: string
    phone_number: string
    password: string
    role: string[]
    created_at: string
    updated_at: string
    deleted_at: string
  }

  // ===============================
  // ✅ Register Model
  // ===============================
  export interface RegisterUserModel {
    citizen_id: string
    first_name: string
    last_name: string
    phone_number: string
    password: string
  }

  export interface RegisterUserResponseModel {
    hospital_number: number
  }

  // ===============================
  // ✅ Register a new user
  // ===============================
  export async function register(registerUserModel: RegisterUserModel) {
    const res = await client.post(`${USERS_URL}/users`, registerUserModel)
    return res.data as ApiResponse<RegisterUserResponseModel>
  }

  // ===============================
  // ✅ Get user by ID
  // ===============================
  export async function getUserById(userId: number) {
    const res = await client.get(`${USERS_URL}/users/${userId}`)
    return res.data as ApiResponse<UserEntity>
  }
}
