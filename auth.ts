import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin"
  },
  providers: [
    Credentials({
      name: "Email and Password",
      credentials: {
        email: {
          label: "Email",
          type: "email"
        },
        password: {
          label: "Password",
          type: "password"
        }
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const email = parsed.data.email.toLowerCase();
        const user = await prisma.user.findUnique({
          where: { email }
        });

        if (!user?.passwordHash) {
          return null;
        }

        const isValid = verifyPassword(parsed.data.password, user.passwordHash);

        if (!isValid || !user.email) {
          return null;
        }

        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

        if (adminEmail && email === adminEmail && user.role !== "ADMIN") {
          const existingAdmin = await prisma.user.findFirst({
            where: { role: "ADMIN" },
            select: { id: true }
          });

          if (!existingAdmin) {
            await prisma.user.update({
              where: { id: user.id },
              data: { role: "ADMIN" }
            });
            user.role = "ADMIN";
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as typeof user & { role?: "USER" | "ADMIN" }).role || "USER";
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || "";
        session.user.role = (token.role as "USER" | "ADMIN") || "USER";
      }

      return session;
    }
  }
};

export function auth() {
  return getServerSession(authOptions);
}
