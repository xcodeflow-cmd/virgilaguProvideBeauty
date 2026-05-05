import nodemailer from "nodemailer";

function getMailConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim() || user;

  if (!host || !user || !pass || !from) {
    return null;
  }

  return {
    host,
    port,
    user,
    pass,
    from,
    secure: process.env.SMTP_SECURE === "true" || port === 465
  };
}

export function isMailConfigured() {
  return Boolean(getMailConfig());
}

export async function sendPasswordResetEmail({ to, resetUrl }: { to: string; resetUrl: string }) {
  const config = getMailConfig();

  if (!config) {
    throw new Error("SMTP is not configured.");
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  await transporter.sendMail({
    from: config.from,
    to,
    subject: "Resetare parola Virgil Agu",
    text: `Salut,\n\nApasa pe linkul de mai jos pentru a-ti reseta parola:\n${resetUrl}\n\nLinkul expira in 60 de minute.\n`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
        <p>Salut,</p>
        <p>Apasa pe butonul de mai jos pentru a-ti reseta parola.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#c99f62;color:#111;text-decoration:none;font-weight:700">Reseteaza parola</a></p>
        <p>Sau foloseste acest link:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>Linkul expira in 60 de minute.</p>
      </div>
    `
  });
}
