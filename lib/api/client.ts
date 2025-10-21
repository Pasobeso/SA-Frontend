import axios, { Axios } from "axios";
import { BASE_URL } from "./microservices";

// lib/api.ts
export class ApiClient {
  baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseURL}${path}`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      ...options,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Fetch error ${res.status}: ${errorText}`);
    }

    return res.json();
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" });
  }

  post<T>(path: string, data: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  put<T>(path: string, data: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});
