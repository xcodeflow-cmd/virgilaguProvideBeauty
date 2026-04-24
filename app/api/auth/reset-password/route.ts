import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";

const resetPasswordSchema = z.object({
  token: z.string().trim().min(1),
  password: z.string().min(8).max(100)
});

export async function POST(request: Request) {
  const payload = resetPasswordSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Date invalide pentru resetare." }, { status: 400 });
  }

  const tokenHash = hashToken(payload.data.token);

  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true
      }
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= new Date()) {
      return NextResponse.json({ error: "Linkul de resetare este invalid sau expirat." }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash: hashPassword(payload.data.password)
        }
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: {
          usedAt: new Date()
        }
      }),
      prisma.passwordResetToken.deleteMany({
        where: {
          userId: resetToken.userId,
          id: { not: resetToken.id }
        }
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
