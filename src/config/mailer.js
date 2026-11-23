import nodemailer from 'nodemailer';

/*
 * Two ways to send email:
 *  - "brevo": Brevo's HTTPS API (port 443). Use this on Render's free plan, which blocks
 *             outgoing SMTP ports 25/465/587. Set BREVO_API_KEY.
 *  - "smtp":  Nodemailer over SMTP (e.g. Gmail + App Password). Works locally and on paid hosts.
 * Brevo wins if both are configured.
 */

let transporter;

const env = (k, d = '') => (process.env[k] ?? d).trim();

export function mailConfig() {
  const user = env('SMTP_USER');
  const to = env('MAIL_TO') || user;
  return {
    brevoKey: env('BREVO_API_KEY'),
    host: env('SMTP_HOST', 'smtp.gmail.com'),
    port: Number(env('SMTP_PORT', '465')),
    user,
    pass: env('SMTP_PASS').replace(/\s+/g, ''), // Gmail shows app passwords with spaces
    to,
    from: env('MAIL_FROM') || user || to, // must be a verified sender in Brevo
    fromName: env('MAIL_FROM_NAME', 'Portfolio'),
    autoReply: env('AUTO_REPLY', 'true') !== 'false',
    ownerName: env('OWNER_NAME', 'Kaunain Kasab'),
  };
}

export function mailProvider() {
  const c = mailConfig();
  if (c.brevoKey && c.from && c.to) return 'brevo';
  if (c.user && c.pass && c.to) return 'smtp';
  return 'off';
}

export const mailEnabled = () => mailProvider() !== 'off';

export function getTransporter() {
  if (transporter) return transporter;
  const { host, port, user, pass } = mailConfig();
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 15_000,
  });
  return transporter;
}

// Lets tests swap in a fake SMTP transport.
export function setTransporter(t) {
  transporter = t;
}

const BREVO = 'https://api.brevo.com/v3';

async function brevoRequest(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${BREVO}${path}`, {
    method,
    headers: {
      'api-key': mailConfig().brevoKey,
      accept: 'application/json',
      ...(body && { 'content-type': 'application/json' }),
    },
    body: body && JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${data.message || data.code || res.statusText}`);
  return data;
}

/**
 * Provider-neutral send.
 * @param {{ from: {name, email}, to: {name?, email}, replyTo?: {name?, email}, subject, html, text }} m
 */
export async function sendMail(m) {
  const provider = mailProvider();
  if (provider === 'brevo') {
    return brevoRequest('/smtp/email', {
      method: 'POST',
      body: {
        sender: { name: m.from.name, email: m.from.email },
        to: [m.to.name ? { email: m.to.email, name: m.to.name } : { email: m.to.email }],
        ...(m.replyTo && { replyTo: m.replyTo.name ? m.replyTo : { email: m.replyTo.email } }),
        subject: m.subject,
        htmlContent: m.html,
        textContent: m.text,
      },
    });
  }
  if (provider === 'smtp') {
    const addr = (a) => (a.name ? { name: a.name, address: a.email } : a.email);
    return getTransporter().sendMail({
      from: addr(m.from),
      to: addr(m.to),
      replyTo: m.replyTo && addr(m.replyTo),
      subject: m.subject,
      html: m.html,
      text: m.text,
    });
  }
  throw new Error('Email is not configured');
}

// Called on startup so a bad key / password shows up in the logs right away.
export async function verifyMailer() {
  const provider = mailProvider();
  const { to, from } = mailConfig();
  try {
    if (provider === 'off') {
      console.log('Email: not configured (set BREVO_API_KEY, or SMTP_USER + SMTP_PASS). Messages are still saved.');
    } else if (provider === 'brevo') {
      await brevoRequest('/account');
      console.log(`Email: Brevo API ready — sending from ${from}, alerts go to ${to}`);
    } else {
      await getTransporter().verify();
      console.log(`Email: SMTP ready — alerts go to ${to}`);
    }
  } catch (err) {
    console.error(`Email (${provider}) check failed —`, err.message);
    if (provider === 'smtp' && /timeout|ETIMEDOUT|ENETUNREACH|ECONNREFUSED/i.test(err.message)) {
      console.error('Hint: Render\'s free plan blocks SMTP ports. Use BREVO_API_KEY instead (see README).');
    }
  }
}
