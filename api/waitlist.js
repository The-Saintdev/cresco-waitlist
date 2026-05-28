import {
    sql
} from "@vercel/postgres";
import {
    BrevoClient
} from "@getbrevo/brevo";

const client = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({
        error: "Method not allowed"
    });

    try {
        const {
            fullName,
            email
        } = req.body;

        if (!fullName || !email) {
            return res.status(400).json({
                error: "Name and email are required"
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const cleanName = fullName.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                error: "Invalid email address"
            });
        }

        await sql `
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

        const existing = await sql `SELECT id FROM waitlist WHERE email = ${cleanEmail}`;
        if (existing.rows.length > 0) {
            return res.status(400).json({
                error: "You are already on the waitlist"
            });
        }

        await sql `INSERT INTO waitlist (full_name, email) VALUES (${cleanName}, ${cleanEmail})`;

        const countResult = await sql `SELECT COUNT(*) as total FROM waitlist`;
        const totalSignups = countResult.rows[0].total;

        // Confirmation email to signee
        try {
            await client.transactionalEmails.sendTransacEmail({
                sender: {
                    name: process.env.BREVO_SENDER_NAME || "Team Cresco AI",
                    email: process.env.BREVO_SENDER_EMAIL,
                },
                to: [{
                    email: cleanEmail,
                    name: cleanName
                }],
                subject: "Welcome to the Cresco AI Early Access Waitlist",
                htmlContent: `
          <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#120008;color:#f0e6d8;padding:40px 32px;border-radius:16px;">
            <div style="margin-bottom:28px;">
              <span style="background:#c9913a;color:#1a0d00;font-weight:700;padding:7px 14px;border-radius:8px;font-size:14px;letter-spacing:0.04em;">⚡ CRESCO AI</span>
            </div>
            <h1 style="font-size:26px;font-weight:700;margin-bottom:6px;color:#f0e6d8;">Hey ${cleanName},</h1>
            <h2 style="font-size:17px;font-weight:600;color:#c9913a;margin-bottom:24px;">Welcome to Cresco AI.</h2>
            <p style="font-size:15px;line-height:1.7;color:#c8b09a;margin-bottom:18px;">
              You're officially on the early access waitlist and among the first people getting access to what we're building.
            </p>
            <p style="font-size:15px;line-height:1.7;color:#c8b09a;margin-bottom:18px;">
              Cresco AI is designed to help businesses automate customer conversations directly on WhatsApp using AI — reducing stress, saving time, and making communication faster and easier.
            </p>
            <p style="font-size:15px;line-height:1.7;color:#c8b09a;margin-bottom:28px;">
              Right now, we're actively preparing for launch and improving the platform before opening access to our first users.
            </p>
            <div style="background:#1c0a10;border-radius:12px;padding:22px;margin-bottom:28px;border-left:3px solid #c9913a;">
              <p style="font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#c9913a;margin-bottom:14px;">As an early waitlist member, you'll be among the first to:</p>
              ${[
                'Test the platform before public launch',
                'Access new features early',
                'Receive important launch updates',
                'Help shape the future of Cresco AI through feedback',
              ].map(item => `
                <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;">
                  <span style="color:#c9913a;font-weight:700;font-size:14px;">✓</span>
                  <span style="font-size:14px;color:#c8b09a;line-height:1.5;">${item}</span>
                </div>
              `).join('')}
            </div>
            <p style="font-size:15px;line-height:1.7;color:#c8b09a;margin-bottom:16px;">
              We're currently focused on building a smarter and simpler way for businesses to handle customer communication without spending all day replying to chats manually.
            </p>
            <p style="font-size:15px;line-height:1.7;color:#c8b09a;margin-bottom:8px;">This is only the beginning. Over the next few days, we'll be sharing:</p>
            <div style="margin-bottom:28px;">
              ${['Product updates', 'Feature previews', 'Launch information', 'Early access announcements'].map(item => `
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
                  <div style="width:5px;height:5px;border-radius:50%;background:#c9913a;flex-shrink:0;"></div>
                  <span style="font-size:14px;color:#c8b09a;">${item}</span>
                </div>
              `).join('')}
            </div>
            <p style="font-size:15px;line-height:1.7;color:#c8b09a;margin-bottom:28px;">
              We're excited to have you here early. <strong style="color:#f0e6d8;">Welcome to Cresco AI.</strong>
            </p>
            <div style="border-top:1px solid rgba(74,46,32,0.5);padding-top:20px;">
              <p style="font-size:14px;color:#7a5c4a;margin:0;">— Team Cresco AI</p>
              <p style="font-size:11px;color:#4a2e20;margin-top:6px;letter-spacing:0.06em;">BUILT IN NIGERIA. SERVING THE WORLD.</p>
            </div>
          </div>
        `,
            });
        } catch (emailErr) {
            console.error("Confirmation email failed:", emailErr);
        }

        // Admin notification
        try {
            await client.transactionalEmails.sendTransacEmail({
                sender: {
                    name: "Cresco AI Waitlist",
                    email: process.env.BREVO_SENDER_EMAIL,
                },
                to: [{
                    email: process.env.NOTIFY_EMAIL,
                    name: "Cresco Team"
                }],
                subject: `New waitlist signup — ${cleanName}`,
                htmlContent: `
          <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:480px;margin:0 auto;background:#120008;color:#f0e6d8;padding:32px;border-radius:16px;">
            <div style="margin-bottom:20px;">
              <span style="background:#c9913a;color:#1a0d00;font-weight:700;padding:6px 12px;border-radius:6px;font-size:13px;">⚡ CRESCO AI</span>
            </div>
            <h2 style="font-size:18px;font-weight:700;margin-bottom:20px;color:#f0e6d8;">New Waitlist Signup</h2>
            <div style="background:#1c0a10;border-radius:10px;padding:18px;margin-bottom:14px;">
              <p style="margin:0 0 6px;font-size:11px;color:#7a5c4a;text-transform:uppercase;letter-spacing:0.08em;">Name</p>
              <p style="margin:0;font-size:20px;font-weight:600;color:#c9913a;">${cleanName}</p>
            </div>
            <div style="background:#1c0a10;border-radius:10px;padding:18px;">
              <p style="margin:0 0 6px;font-size:11px;color:#7a5c4a;text-transform:uppercase;letter-spacing:0.08em;">Total Signups</p>
              <p style="margin:0;font-size:36px;font-weight:700;color:#f0e6d8;">${totalSignups}</p>
            </div>
          </div>
        `,
            });
        } catch (notifyErr) {
            console.error("Admin notification failed:", notifyErr);
        }

        // Add to Brevo contact list
        try {
            await client.contacts.createContact({
                email: cleanEmail,
                attributes: {
                    FIRSTNAME: cleanName.split(" ")[0],
                    LASTNAME: cleanName.split(" ").slice(1).join(" ") || "",
                },
                listIds: [parseInt(process.env.BREVO_WAITLIST_LIST_ID)],
                updateEnabled: true,
            });
        } catch (contactErr) {
            console.error("Brevo contact creation failed:", contactErr);
        }

        return res.status(200).json({
            success: true,
            message: "You are on the waitlist!"
        });

    } catch (err) {
        console.error("Waitlist API fatal error:", err);
        if (err.message?.includes("duplicate") || err.message?.includes("unique")) {
            return res.status(400).json({
                error: "You are already on the waitlist"
            });
        }
        return res.status(500).json({
            error: "Something went wrong. Please try again."
        });
    }
}