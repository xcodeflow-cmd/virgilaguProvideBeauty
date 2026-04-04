import { NextResponse } from "next/server";
import { z } from "zod";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const bookingSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  service: z.string().min(2),
  preferredAt: z.string(),
  notes: z.string().optional()
});

export async function POST(request: Request) {
  const session = await auth();
  const payload = bookingSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ error: "Invalid booking payload." }, { status: 400 });
  }

  try {
    const booking = await prisma.booking.create({
      data: {
        ...payload.data,
        preferredAt: new Date(payload.data.preferredAt),
        userId: session?.user?.id
      }
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Could not save booking." }, { status: 500 });
  }
}
