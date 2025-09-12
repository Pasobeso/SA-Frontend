import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  // naive check
  if (body.citizen_id && body.first_name && body.last_name && body.phone_number && body.password) {
    return NextResponse.json({ ok: true }, { status: 201 });
  }

  return NextResponse.json({ message: "Invalid data" }, { status: 400 });
}
