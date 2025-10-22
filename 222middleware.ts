// middleware.ts
import { NextRequest, NextResponse } from "next/server"

type Role = "Patient" | "Doctor" | string | undefined

// If your backend also sets a simple role cookie, put its name here:
const ROLE_COOKIE_NAME = "role"

// If you know your token cookie name(s), list them here; we’ll also auto-detect JWT-looking cookies.
const TOKEN_COOKIE_GUESSES = ["access_token", "jwt", "token"]

const isPublicPath = (pathname: string) =>
  pathname === "/login" ||
  pathname === "/" ||
  pathname.startsWith("/_next") ||
  pathname.startsWith("/api") ||
  pathname.startsWith("/favicon") ||
  pathname.startsWith("/assets") ||
  pathname.startsWith("/static") ||
  /\.[a-zA-Z0-9]+$/.test(pathname)

function pickJwtCookie(req: NextRequest): string | undefined {
  // Prefer known names
  for (const n of TOKEN_COOKIE_GUESSES) {
    const v = req.cookies.get(n)?.value
    if (v) return v
  }
  // Otherwise, grab the first cookie that *looks* like a JWT (xxx.yyy.zzz)
  for (const c of req.cookies.getAll()) {
    if (c.value.split(".").length === 3) return c.value
  }
  return undefined
}

function decodeJwtPayload<T = any>(token: string): T | undefined {
  try {
    const parts = token.split(".")
    if (parts.length < 2) return undefined
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/")
    const json = decodeURIComponent(
      Array.prototype.map
        .call(atob(base64), (c: string) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    )
    return JSON.parse(json) as T
  } catch {
    return undefined
  }
}

function isExpired(exp?: number): boolean {
  if (!exp) return false
  return Math.floor(Date.now() / 1000) >= exp
}

function normalizeRole(roleLike: unknown): Role {
  // Accept: "Patient" | "patient" | "PATIENT" | ["Patient"] | ["Doctor", "Patient"]
  if (!roleLike) return undefined
  if (typeof roleLike === "string") {
    const v = roleLike.toLowerCase()
    if (v.includes("patient")) return "Patient"
    if (v.includes("doctor")) return "Doctor"
    return roleLike
  }
  if (Array.isArray(roleLike)) {
    const lower = roleLike.map(String).map((s) => s.toLowerCase())
    if (lower.includes("patient")) return "Patient"
    if (lower.includes("doctor")) return "Doctor"
  }
  return undefined
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public routes pass through; if already logged in and hitting "/" or "/login", bounce to role home
  if (isPublicPath(pathname)) {
    if (pathname === "/" || pathname === "/login") {
      const token = pickJwtCookie(req)
      const claims = token ? decodeJwtPayload<{ exp?: number; role?: Role; roles?: string[] }>(token) : undefined
      const cookieRole = normalizeRole(req.cookies.get(ROLE_COOKIE_NAME)?.value)
      const role = normalizeRole(claims?.role) ?? normalizeRole(claims?.roles) ?? cookieRole

      if (token && claims && !isExpired(claims.exp) && role) {
        const url = new URL(role === "Doctor" ? "/doctor" : "/patient", req.url)
        return NextResponse.redirect(url)
      }
    }
    return NextResponse.next()
  }

  // Protected paths
  const token = pickJwtCookie(req)
  const claims = token ? decodeJwtPayload<{ exp?: number; role?: Role; roles?: string[] }>(token) : undefined
  const cookieRole = normalizeRole(req.cookies.get(ROLE_COOKIE_NAME)?.value)
  const role = normalizeRole(claims?.role) ?? normalizeRole(claims?.roles) ?? cookieRole

  if (!token || !claims || isExpired(claims.exp) || !role) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const isPatientArea = pathname.startsWith("/patient")
  const isDoctorArea = pathname.startsWith("/doctor")

  if (role === "Patient" && !isPatientArea) {
    return NextResponse.redirect(new URL("/patient", req.url))
  }
  if (role === "Doctor" && !isDoctorArea) {
    return NextResponse.redirect(new URL("/doctor", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
