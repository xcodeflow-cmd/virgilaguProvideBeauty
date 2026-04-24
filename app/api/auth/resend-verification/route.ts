import { NextResponse } from "next/server";
import { z } from "zod";

import { resendVerificationEmail } from "@/lib/auth-email";

const resendVerificationSchema = z.object({
  email: z.string().trim().email()
});

export async function POST(request: Request) {
  const payload = resendVerificationSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Email invalid." }, { status: 400 });
  }

  try {
    await resendVerificationEmail(payload.data.email.toLowerCase());

    return NextResponse.json({
      ok: true,
      message: "Daca exista un cont neverificat, am retrimis emailul de confirmare."
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Nu am putut retrimite emailul de confirmare." }, { status: 500 });
  }
}
