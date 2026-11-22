import nodemailer from 'nodemailer';

let transporter;

const env = (k, d = '') => (process.env[k] ?? d).trim();

export function mailConfig() {
  const user = env('SMTP_USER');
  return {
    host: env('SMTP_HOST', 'smtp.gmail.com'),
    port: Number(env('SMTP_PORT', '465')),
    user,
    pass: env('SMTP_PASS').replace(/\s+/g, ''), // Gmail shows app passwords with spaces
    to: env('MAIL_TO') || user,
    fromName: env('MAIL_FROM_NAME', 'Portfolio'),
    autoReply: env('AUTO_REPLY', 'true') !== 'false',
    ownerName: env('OWNER_NAME', 'Kaunain Kasab'),
  };
}

export const mailEnabled = () => {
  const { user, pass } = mailConfig();
  return Boolean(user && pass);
};

export function getTransporter() {
  if (transporter) return transporter;
  const { host, port, user, pass } = mailConfig();
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

// Lets tests swap in a fake transport.
export function setTransporter(t) {
  transporter = t;
}

// Called on startup so a wrong password shows up in the logs right away.
export async function verifyMailer() {
  if (!mailEnabled()) {
    console.log('Email: SMTP_USER / SMTP_PASS not set — contact emails are disabled (messages are still saved).');
    return;
  }
  try {
    await getTransporter().verify();
    console.log(`Email: ready, notifications go to ${mailConfig().to}`);
  } catch (err) {
    console.error('Email: SMTP login failed —', err.message);
  }
}
