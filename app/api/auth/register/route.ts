import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.string().trim().email(),
  password: z.string().min(8).max(100)
});

export async function POST(request: Request) {
  const payload = registerSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Date invalide pentru cont." }, { status: 400 });
  }

  const email = payload.data.email.toLowerCase();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Există deja un cont cu emailul acesta." }, { status: 409 });
    }

    await prisma.user.create({
      data: {
        name: payload.data.name || null,
        email,
        passwordHash: hashPassword(payload.data.password)
      }
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Contul nu a putut fi creat." }, { status: 500 });
  }
}
