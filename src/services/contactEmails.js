import { mailConfig, mailEnabled, sendMail } from '../config/mailer.js';

const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const oneLine = (s = '') => String(s).replace(/[\r\n]+/g, ' ').trim();

const shell = (body) => `
<div style="background:#0b0a24;padding:32px 16px;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;background:#14123a;border:1px solid #2e2a6b;border-radius:16px;overflow:hidden">
    <div style="height:6px;background:linear-gradient(90deg,#a855f7,#6366f1)"></div>
    <div style="padding:28px;color:#e8e6ff;font-size:15px;line-height:1.6">${body}</div>
  </div>
</div>`;

function row(label, value) {
  if (!value) return '';
  return `<tr>
    <td style="padding:6px 12px 6px 0;color:#a9a6cf;white-space:nowrap;vertical-align:top">${label}</td>
    <td style="padding:6px 0;color:#ffffff">${value}</td>
  </tr>`;
}

export function buildOwnerEmail(msg) {
  const { name, email, subject, budget, message, createdAt } = msg;
  const when = new Date(createdAt || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  return {
    subject: oneLine(`New enquiry from ${name}${subject ? ` — ${subject}` : ''}`).slice(0, 150),
    text: [
      `New message from your portfolio`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      subject ? `Project type: ${subject}` : null,
      budget ? `Budget: ${budget}` : null,
      `Received: ${when} IST`,
      ``,
      message,
      ``,
      `Reply to this email to answer ${name} directly.`,
    ]
      .filter((l) => l !== null)
      .join('\n'),
    html: shell(`
      <h2 style="margin:0 0 4px;color:#ffffff;font-size:20px">New portfolio enquiry</h2>
      <p style="margin:0 0 20px;color:#a9a6cf;font-size:13px">${esc(when)} IST</p>
      <table style="border-collapse:collapse;font-size:14px;margin-bottom:20px">
        ${row('Name', esc(name))}
        ${row('Email', `<a href="mailto:${esc(email)}" style="color:#c4b5fd">${esc(email)}</a>`)}
        ${row('Project', esc(subject))}
        ${row('Budget', esc(budget))}
      </table>
      <div style="background:#0f0d2e;border:1px solid #2e2a6b;border-radius:12px;padding:16px;white-space:pre-wrap;color:#ffffff">${esc(message)}</div>
      <p style="margin:20px 0 0;color:#a9a6cf;font-size:13px">Just hit <b>Reply</b> to answer ${esc(name)} directly.</p>
    `),
  };
}

export function buildAutoReply(msg, ownerName) {
  const first = oneLine(msg.name).split(' ')[0].slice(0, 40);
  return {
    subject: `Thanks for reaching out — ${ownerName}`,
    text: [
      `Hi ${first},`,
      ``,
      `Thanks for getting in touch! I've received your message and will reply within 24 hours with next steps.`,
      ``,
      `If it's urgent, you can also reach me on WhatsApp: https://wa.me/918070740009`,
      ``,
      `Best regards,`,
      ownerName,
      `Frontend Developer · Websites & Mobile Apps`,
    ].join('\n'),
    html: shell(`
      <p style="margin:0 0 14px">Hi ${esc(first)},</p>
      <p style="margin:0 0 14px">Thanks for getting in touch! I’ve received your message and will reply
        <b style="color:#c4b5fd">within 24 hours</b> with next steps.</p>
      <p style="margin:0 0 22px">If it’s urgent, you can also reach me on
        <a href="https://wa.me/918070740009" style="color:#c4b5fd">WhatsApp</a>.</p>
      <p style="margin:0">Best regards,<br><b style="color:#ffffff">${esc(ownerName)}</b><br>
        <span style="color:#a9a6cf;font-size:13px">Frontend Developer · Websites &amp; Mobile Apps</span></p>
    `),
  };
}

/**
 * Sends the "new enquiry" alert to you and (optionally) a thank-you to the visitor.
 * Never throws — the message is already saved in MongoDB, so email problems are only logged.
 */
export async function sendContactEmails(msg) {
  if (!mailEnabled()) return { skipped: true };
  const cfg = mailConfig();
  const from = { name: cfg.fromName, email: cfg.from };

  const jobs = [
    sendMail({ from, to: { email: cfg.to }, replyTo: { name: oneLine(msg.name), email: msg.email }, ...buildOwnerEmail(msg) }),
  ];
  if (cfg.autoReply) {
    jobs.push(sendMail({ from, to: { email: msg.email }, replyTo: { email: cfg.to }, ...buildAutoReply(msg, cfg.ownerName) }));
  }

  const results = await Promise.allSettled(jobs);
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`Email ${i === 0 ? 'alert' : 'auto-reply'} failed:`, r.reason?.message);
  });
  return { sent: results.filter((r) => r.status === 'fulfilled').length, failed: results.filter((r) => r.status === 'rejected').length };
}
