import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const resetPasswordSchema = z.object({
  token: z.string().trim().min(1),
  password: z.string().min(8).max(100)
});

export async function POST(request: Request) {
  const payload = resetPasswordSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Date invalide pentru resetare." }, { status: 400 });
  }

  try {
    const resetToken = await prisma.verificationToken.findUnique({
      where: { token: payload.data.token }
    });

    if (!resetToken || resetToken.expires <= new Date() || !resetToken.identifier.startsWith("password-reset:")) {
      return NextResponse.json({ error: "Linkul de resetare este invalid sau expirat." }, { status: 400 });
    }

    const email = resetToken.identifier.replace("password-reset:", "");

    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: {
          passwordHash: hashPassword(payload.data.password)
        }
      }),
      prisma.verificationToken.deleteMany({
        where: { identifier: resetToken.identifier }
      })
    ]);

    return NextResponse.json({
      ok: true,
      message: "Parola a fost schimbata. Te poti autentifica acum."
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Parola nu a putut fi resetata." }, { status: 500 });
  }
}
