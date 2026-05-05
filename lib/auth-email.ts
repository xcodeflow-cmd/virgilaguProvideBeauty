import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { generateRawToken } from "@/lib/tokens";

const EMAIL_VERIFICATION_TTL_MS = 1000 * 60 * 60 * 24;
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 30;

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function getUserDisplayName(name?: string | null, email?: string | null) {
  return name?.trim() || email?.trim() || "client";
}

function buildEmailLayout({
  preview,
  title,
  intro,
  actionLabel,
  actionUrl,
  outro
}: {
  preview: string;
  title: string;
  intro: string;
  actionLabel: string;
  actionUrl: string;
  outro: string;
}) {
  const html = `
    <div style="margin:0;padding:32px 16px;background:#080808;font-family:Arial,sans-serif;color:#f5f5f5">
      <div style="max-width:560px;margin:0 auto;background:#111111;border:1px solid rgba(255,255,255,0.08);border-radius:24px;padding:32px">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.28em;text-transform:uppercase;color:#d6b98c">${preview}</p>
        <h1 style="margin:0 0 16px;font-size:32px;line-height:1.05;color:#ffffff">${title}</h1>
        <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:rgba(255,255,255,0.72)">${intro}</p>
        <a href="${actionUrl}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#d6b98c;color:#1d160b;text-decoration:none;font-weight:700">${actionLabel}</a>
        <p style="margin:24px 0 0;font-size:14px;line-height:1.8;color:rgba(255,255,255,0.6)">${outro}</p>
        <p style="margin:24px 0 0;font-size:12px;line-height:1.7;color:rgba(255,255,255,0.42)">Daca butonul nu functioneaza, copiaza acest link in browser:<br /><span style="color:#d6b98c;word-break:break-all">${actionUrl}</span></p>
      </div>
    </div>
  `;

  return html;
}

export async function createEmailVerificationToken(email: string) {
  const rawToken = generateRawToken();
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

  await prisma.verificationToken.deleteMany({
    where: { identifier: email }
  });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: rawToken,
      expires: expiresAt
    }
  });

  return rawToken;
}

export async function sendVerificationEmail({
  email,
  name
}: {
  email: string;
  name?: string | null;
}) {
  const rawToken = await createEmailVerificationToken(email);
  const actionUrl = `${getBaseUrl()}/auth/verify-email?token=${encodeURIComponent(rawToken)}`;
  const displayName = getUserDisplayName(name, email);

  await sendMail({
    to: email,
    subject: "Confirma-ti contul",
    text: `Salut, ${displayName}. Confirma-ti contul accesand linkul: ${actionUrl}`,
    html: buildEmailLayout({
      preview: "Confirmare cont",
      title: "Activeaza-ti contul",
      intro: `Salut, ${displayName}. Pentru a activa contul tau, confirma adresa de email folosind butonul de mai jos.`,
      actionLabel: "Confirma contul",
      actionUrl,
      outro: "Linkul expira in 24 de ore."
    })
  });
}

export async function verifyEmailToken(token: string) {
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token }
  });

  if (!verificationToken || verificationToken.expires <= new Date()) {
    return { ok: false as const, error: "Linkul de confirmare este invalid sau expirat." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: verificationToken.identifier },
      data: {
        emailVerified: new Date()
      }
    }),
    prisma.verificationToken.deleteMany({
      where: { identifier: verificationToken.identifier }
    })
  ]);

  return { ok: true as const };
}

export async function resendVerificationEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      name: true,
      email: true,
      emailVerified: true
    }
  });

  if (!user || !user.email || user.emailVerified) {
    return;
  }

  await sendVerificationEmail({
    email: user.email,
    name: user.name
  });
}

export async function createPasswordResetToken(email: string) {
  const rawToken = generateRawToken();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
  const identifier = `password-reset:${email}`;

  await prisma.verificationToken.deleteMany({
    where: { identifier }
  });

  await prisma.verificationToken.create({
    data: {
      identifier,
      token: rawToken,
      expires: expiresAt
    }
  });

  return rawToken;
}

export async function sendPasswordResetEmail({
  email,
  name
}: {
  email: string;
  name?: string | null;
}) {
  const rawToken = await createPasswordResetToken(email);
  const actionUrl = `${getBaseUrl()}/auth/reset-password?token=${encodeURIComponent(rawToken)}`;
  const displayName = getUserDisplayName(name, email);

  await sendMail({
    to: email,
    subject: "Reseteaza-ti parola",
    text: `Salut, ${displayName}. Reseteaza parola accesand linkul: ${actionUrl}`,
    html: buildEmailLayout({
      preview: "Resetare parola",
      title: "Schimba-ti parola",
      intro: `Salut, ${displayName}. Am primit o cerere de resetare a parolei. Daca tu ai facut cererea, foloseste butonul de mai jos.`,
      actionLabel: "Reseteaza parola",
      actionUrl,
      outro: "Linkul expira in 30 de minute. Daca nu ai cerut resetarea, poti ignora acest email."
    })
  });
}
