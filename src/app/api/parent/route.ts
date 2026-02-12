import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { pin } = (await req.json()) as { pin: string };
    const correctPin = process.env.PARENT_PIN || "1234";

    if (pin === correctPin) {
      return NextResponse.json({ authenticated: true });
    }

    return NextResponse.json(
      { authenticated: false, error: "Incorrect PIN" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
