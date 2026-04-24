import nodemailer from "nodemailer";

function requireEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }

  return value;
}

function getPort() {
  const rawPort = process.env.SMTP_PORT?.trim();

  if (!rawPort) {
    return 587;
  }

  const port = Number(rawPort);

  if (!Number.isFinite(port)) {
    throw new Error("SMTP_PORT must be a valid number.");
  }

  return port;
}

function isSecurePort(port: number) {
  const envSecure = process.env.SMTP_SECURE?.trim();

  if (envSecure === "true") {
    return true;
  }

  if (envSecure === "false") {
    return false;
  }

  return port === 465;
}

function getTransporter() {
  const port = getPort();

  return nodemailer.createTransport({
    host: requireEnv("SMTP_HOST"),
    port,
    secure: isSecurePort(port),
    auth: {
      user: requireEnv("SMTP_USER"),
      pass: requireEnv("SMTP_PASSWORD")
    }
  });
}

export async function sendMail({
  to,
  subject,
  html,
  text
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM?.trim() || requireEnv("SMTP_USER"),
    to,
    subject,
    html,
    text
  });
}
