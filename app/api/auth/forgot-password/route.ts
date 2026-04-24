import { NextResponse } from "next/server";
import { z } from "zod";

import { sendPasswordResetEmail } from "@/lib/auth-email";
import { prisma } from "@/lib/prisma";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email()
});

export async function POST(request: Request) {
  const payload = forgotPasswordSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Email invalid." }, { status: 400 });
  }

  const email = payload.data.email.toLowerCase();

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true
      }
    });

    if (user?.email && user.emailVerified) {
      await sendPasswordResetEmail({
        userId: user.id,
        email: user.email,
        name: user.name
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Daca exista un cont pentru acest email, am trimis instructiunile de resetare."
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Nu am putut procesa cererea." }, { status: 500 });
  }
}
