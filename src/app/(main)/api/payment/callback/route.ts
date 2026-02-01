import { NextResponse } from "next/server";

export async function POST(req: Request) {
 console.log("Callback hit successfully")
  try {
    const body = await req.json();
    console.log("PHONEPE CALLBACK:", body);

    // PhonePe expects strictly 200
    return NextResponse.json({ ok: true }, { status: 200 });

  } catch (err) {
    console.log("CALLBACK ERROR:", err);
    return NextResponse.json({ ok: true }, { status: 200 }); // still 200
  }
}

export async function GET() {
    console.log("CALLBACK GET CHECK");
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }