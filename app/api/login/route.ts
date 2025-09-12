import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  if (body.hospital_number === 100001 && body.password === "test123") {
    return NextResponse.json({ token: "mock-token-123" });
  }

  return NextResponse.json({ message: "Invalid Hospital Number or Password" }, { status: 401 });
}
