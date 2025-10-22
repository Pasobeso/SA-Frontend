import axios from "axios"
import { BASE_URL } from "./microservices"

// ==============================
// ✅ Fetch-based client (for optional use)
// ==============================
export class ApiClient {
  baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const token = localStorage.getItem("access_token")

    const res = await fetch(`${this.baseURL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      ...options,
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`❌ Fetch Error ${res.status}:`, errorText)
      throw new Error(`Fetch error ${res.status}: ${errorText}`)
    }

    return res.json()
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" })
  }

  post<T>(path: string, data: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  put<T>(path: string, data: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" })
  }
}

// ==============================
// ✅ Axios client for authenticated requests
// ==============================
export const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// ✅ Automatically attach access token to all requests
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ✅ Global error logging
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `🚨 API Error ${error.response.status}:`,
        error.response.data?.message || error.message
      )
    } else {
      console.error("🌐 Network Error:", error.message)
    }
    return Promise.reject(error)
  }
)
