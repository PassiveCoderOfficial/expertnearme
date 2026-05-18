import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM = 'ExpertNear.Me <hello@expertnear.me>';

export async function sendWaitlistConfirmation(email: string) {
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "You're on the list — ExpertNear.Me",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1e293b">
        <div style="margin-bottom:24px">
          <span style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:14px;padding:6px 14px;border-radius:8px;letter-spacing:0.05em">ExpertNear.Me</span>
        </div>
        <h1 style="font-size:24px;font-weight:700;margin:0 0 12px">You're on the list 🎉</h1>
        <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 20px">
          We'll notify you the moment Pro subscriptions go live on <strong>August 16, 2026</strong>.
        </p>
        <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 28px">
          In the meantime — the <strong>Founding Expert</strong> lifetime deal is still open.
          500 spots at a one-time price, before prices go up at launch.
        </p>
        <a href="https://expertnear.me/pricing" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:14px;padding:14px 28px;border-radius:12px;text-decoration:none">
          Claim Your Founding Spot →
        </a>
        <p style="font-size:12px;color:#94a3b8;margin-top:40px">
          You're receiving this because you joined the ExpertNear.Me waitlist.
          No further emails unless you signed up for Pro.
        </p>
      </div>
    `,
  }).catch(() => {});
}

export async function sendExpertWelcome(email: string, name: string) {
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Your ExpertNear.Me profile is being reviewed',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1e293b">
        <div style="margin-bottom:24px">
          <span style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:14px;padding:6px 14px;border-radius:8px;letter-spacing:0.05em">ExpertNear.Me</span>
        </div>
        <h1 style="font-size:24px;font-weight:700;margin:0 0 12px">Welcome, ${name}! 👋</h1>
        <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 20px">
          Your expert profile has been submitted and is now <strong>under review</strong>.
          We manually verify every listing — you'll hear from us within 24–48 hours.
        </p>
        <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 28px">
          While you wait, you can complete your profile in the dashboard — add portfolio items, services, and your availability.
        </p>
        <a href="https://expertnear.me/dashboard/profile" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:14px;padding:14px 28px;border-radius:12px;text-decoration:none">
          Complete Your Profile →
        </a>
        <p style="font-size:12px;color:#94a3b8;margin-top:40px">
          Questions? Reply to this email or WhatsApp us at +880 167 866 9699.
        </p>
      </div>
    `,
  }).catch(() => {});
}

export async function sendFoundingExpertConfirmation(email: string, name: string) {
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: 'Payment received — Founding Expert spot secured',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1e293b">
        <div style="margin-bottom:24px">
          <span style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:14px;padding:6px 14px;border-radius:8px;letter-spacing:0.05em">ExpertNear.Me</span>
        </div>
        <h1 style="font-size:24px;font-weight:700;margin:0 0 12px">You're a Founding Expert 🏆</h1>
        <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 16px">
          Hi ${name}, your payment has been received. Your <strong>Founding Expert</strong> lifetime access is being activated.
        </p>
        <ul style="font-size:15px;color:#475569;line-height:1.8;margin:0 0 24px;padding-left:20px">
          <li>Founding Expert gold badge on your profile</li>
          <li>Permanent listing in the Hall of Fame</li>
          <li>Priority ranking in search results</li>
          <li>All future Pro features, price locked forever</li>
        </ul>
        <p style="font-size:15px;color:#475569;line-height:1.6;margin:0 0 28px">
          We'll verify your profile and activate your account within <strong>24 hours</strong>. You'll receive a follow-up email when you go live.
        </p>
        <a href="https://expertnear.me/dashboard" style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:14px;padding:14px 28px;border-radius:12px;text-decoration:none">
          Go to Dashboard →
        </a>
        <p style="font-size:12px;color:#94a3b8;margin-top:40px">
          Questions? Reply to this email or WhatsApp +880 167 866 9699. 30-day money-back guarantee applies.
        </p>
      </div>
    `,
  }).catch(() => {});
}
