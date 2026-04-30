import { NewsletterSubscriber } from '../models/NewsletterSubscriber';
import { sendMail } from '../config/mail';
import { env } from '../config/env';

// ─── Subscribe / Unsubscribe ────────────────────────────────────────────────

export async function subscribe(email: string) {
  const existing = await NewsletterSubscriber.findOne({ email });
  if (existing) {
    if (existing.isActive) return { alreadySubscribed: true };
    existing.isActive = true;
    await existing.save();
    return { resubscribed: true };
  }
  const subscriber = await NewsletterSubscriber.create({ email });

  // Welcome email (non-blocking)
  sendMail({
    to: email,
    subject: 'Welcome to the NEEZA newsletter',
    html: welcomeEmail(),
  }).catch(() => {/* suppress */});

  return { subscriber };
}

export async function unsubscribe(email: string) {
  const subscriber = await NewsletterSubscriber.findOneAndUpdate(
    { email },
    { isActive: false },
    { new: true }
  );
  return subscriber;
}

export async function getAllSubscribers() {
  return NewsletterSubscriber.find({ isActive: true }).sort({ subscribedAt: -1 });
}

// ─── Broadcast ──────────────────────────────────────────────────────────────

export async function broadcast(subject: string, html: string): Promise<number> {
  const subscribers = await NewsletterSubscriber.find({ isActive: true }).lean();
  let sent = 0;

  await Promise.allSettled(
    subscribers.map(async (sub) => {
      try {
        await sendMail({ to: sub.email, subject, html: wrapEmail(sub.email, html) });
        sent++;
      } catch { /* individual failure — keep going */ }
    })
  );

  return sent;
}

// ─── Auto-notification helpers ──────────────────────────────────────────────

export async function notifyNewPost(post: {
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
}): Promise<void> {
  const postUrl = `${env.CLIENT_URL}/blog/${post.slug}`;
  const html = `
    <h2 style="color:#B75E1A;margin:0 0 8px">New Article Published</h2>
    <h3 style="margin:0 0 16px;font-size:22px">${post.title}</h3>
    ${post.category ? `<p style="color:#888;font-size:13px;margin:0 0 16px">Category: ${post.category}</p>` : ''}
    ${post.excerpt ? `<p style="color:#555;line-height:1.6;margin:0 0 24px">${post.excerpt}</p>` : ''}
    <a href="${postUrl}" style="background:#B75E1A;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
      Read Article →
    </a>
  `;
  broadcast(`New on NEEZA: ${post.title}`, html).catch(() => {});
}

export async function notifyProjectCompleted(project: {
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  category?: string;
}): Promise<void> {
  const projectUrl = `${env.CLIENT_URL}/projects`;
  const html = `
    <h2 style="color:#B75E1A;margin:0 0 8px">Project Completed</h2>
    <h3 style="margin:0 0 4px;font-size:22px">${project.title}</h3>
    ${project.location ? `<p style="color:#888;font-size:13px;margin:0 0 4px">📍 ${project.location}</p>` : ''}
    ${project.category ? `<p style="color:#888;font-size:13px;margin:0 0 16px">Category: ${project.category}</p>` : ''}
    ${project.description ? `<p style="color:#555;line-height:1.6;margin:0 0 24px">${project.description}</p>` : ''}
    <a href="${projectUrl}" style="background:#B75E1A;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
      View Our Projects →
    </a>
  `;
  broadcast(`NEEZA Project Completed: ${project.title}`, html).catch(() => {});
}

// ─── Email templates ─────────────────────────────────────────────────────────

function wrapEmail(recipientEmail: string, bodyHtml: string): string {
  const unsubUrl = `${env.CLIENT_URL}/unsubscribe?email=${encodeURIComponent(recipientEmail)}`;
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f0;padding:40px 16px">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:100%">

        <!-- Header -->
        <tr>
          <td style="background:#231F1C;padding:32px 40px;text-align:center">
            <span style="font-size:28px;font-weight:700;color:#B75E1A;letter-spacing:-0.5px">NEEZA</span>
            <p style="color:#9ca3af;font-size:12px;margin:6px 0 0;letter-spacing:2px;text-transform:uppercase">Architecture &amp; Engineering</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:40px">
            ${bodyHtml}
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:0 40px"><hr style="border:none;border-top:1px solid #e5e7eb"></td></tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;text-align:center">
            <p style="color:#9ca3af;font-size:12px;margin:0">
              You're receiving this because you subscribed at nezadesigns.com.<br>
              <a href="${unsubUrl}" style="color:#B75E1A;text-decoration:underline">Unsubscribe</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function welcomeEmail(): string {
  return wrapEmail('', `
    <h2 style="color:#B75E1A;margin:0 0 8px;font-size:24px">Welcome aboard 👋</h2>
    <p style="color:#374151;font-size:16px;line-height:1.7;margin:0 0 16px">
      Thank you for subscribing to the <strong>NEEZA</strong> newsletter.<br>
      You'll be the first to hear about:
    </p>
    <ul style="color:#555;line-height:2;padding-left:20px;margin:0 0 24px">
      <li>New projects &amp; case studies</li>
      <li>Architectural insights &amp; trends</li>
      <li>Company news &amp; events</li>
    </ul>
    <a href="${env.CLIENT_URL}" style="background:#B75E1A;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
      Visit Our Website →
    </a>
  `);
}
