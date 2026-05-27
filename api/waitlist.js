import { sql } from "@vercel/postgres";
import { BrevoClient } from "@getbrevo/brevo";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const { fullName, email } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  try {
    // Create table if not exists
    await sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Check duplicate
    const existing = await sql`
      SELECT id FROM waitlist WHERE email = ${email}
    `;

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "You are already on the waitlist" });
    }

    // Save to DB
    const result = await sql`
      INSERT INTO waitlist (full_name, email)
      VALUES (${fullName}, ${email})
      RETURNING id
    `;

    // Get total count for notification
    const countResult = await sql`SELECT COUNT(*) as total FROM waitlist`;
    const totalSignups = countResult.rows[0].total;

    const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

    // 1. Send confirmation email to signee
    await client.transactionalEmails.sendTransacEmail({
      sender: {
        name: process.env.BREVO_SENDER_NAME || "Team Cresco AI",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email, name: fullName }],
      subject: "Welcome to the Cresco AI Early Access Waitlist",
      htmlContent: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #29080c; color: #f5e6e0; padding: 40px 32px; border-radius: 16px;">
          <div style="margin-bottom: 32px;">
            <span style="background: #ff7a00; color: #321200; font-weight: 700; padding: 8px 14px; border-radius: 8px; font-size: 15px;">⚡ Cresco AI</span>
          </div>
          <h1 style="font-size: 26px; font-weight: 700; margin-bottom: 8px; color: #f5e6e0;">Hey ${fullName},</h1>
          <h2 style="font-size: 18px; font-weight: 600; color: #ff7a00; margin-bottom: 24px;">Welcome to Cresco AI.</h2>
          <p style="font-size: 15px; line-height: 1.7; color: #e0c0af; margin-bottom: 20px;">
            You're officially on the early access waitlist and among the first people getting access to what we're building.
          </p>
          <p style="font-size: 15px; line-height: 1.7; color: #e0c0af; margin-bottom: 20px;">
            Cresco AI is designed to help businesses automate customer conversations directly on WhatsApp using AI — reducing stress, saving time, and making communication faster and easier.
          </p>
          <p style="font-size: 15px; line-height: 1.7; color: #e0c0af; margin-bottom: 32px;">
            Right now, we're actively preparing for launch and improving the platform before opening access to our first users.
          </p>
          <div style="background: #331014; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
            <p style="font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #ff7a00; margin-bottom: 16px;">
              As an early waitlist member, you'll be among the first to:
            </p>
            ${[
              "Test the platform before public launch",
              "Access new features early",
              "Receive important launch updates",
              "Help shape the future of Cresco AI through feedback",
            ]
              .map(
                (item) => `
              <div style="display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px;">
                <span style="color: #ff7a00; font-weight: 700;">✓</span>
                <span style="font-size: 14px; color: #e0c0af; line-height: 1.5;">${item}</span>
              </div>
            `,
              )
              .join("")}
          </div>
          <p style="font-size: 15px; line-height: 1.7; color: #e0c0af; margin-bottom: 20px;">
            We're currently focused on building a smarter and simpler way for businesses to handle customer communication without spending all day replying to chats manually.
          </p>
          <p style="font-size: 15px; line-height: 1.7; color: #e0c0af; margin-bottom: 8px;">
            This is only the beginning. Over the next few days, we'll be sharing:
          </p>
          <div style="margin-bottom: 32px;">
            ${[
              "Product updates",
              "Feature previews",
              "Launch information",
              "Early access announcements",
            ]
              .map(
                (item) => `
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <div style="width: 6px; height: 6px; border-radius: 50%; background: #ff7a00; flex-shrink: 0;"></div>
                <span style="font-size: 14px; color: #e0c0af;">${item}</span>
              </div>
            `,
              )
              .join("")}
          </div>
          <p style="font-size: 15px; line-height: 1.7; color: #e0c0af; margin-bottom: 32px;">
            We're excited to have you here early. <strong style="color: #f5e6e0;">Welcome to Cresco AI.</strong>
          </p>
          <div style="border-top: 1px solid rgba(88, 66, 53, 0.4); padding-top: 24px;">
            <p style="font-size: 14px; color: #a78b7c; margin: 0;">— Team Cresco AI</p>
            <p style="font-size: 12px; color: #584235; margin-top: 6px;">Built in Nigeria. Serving the world.</p>
          </div>
        </div>
      `,
    });

    // 2. Send notification email to you
    await client.transactionalEmails.sendTransacEmail({
      sender: {
        name: "Cresco AI Waitlist",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email: process.env.NOTIFY_EMAIL, name: "Cresco Team" }],
      subject: `🎉 New waitlist signup — ${fullName}`,
      htmlContent: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #29080c; color: #f5e6e0; padding: 32px; border-radius: 16px;">
          <div style="margin-bottom: 24px;">
            <span style="background: #ff7a00; color: #321200; font-weight: 700; padding: 6px 12px; border-radius: 6px; font-size: 14px;">⚡ Cresco AI</span>
          </div>
          <h2 style="font-size: 20px; font-weight: 700; margin-bottom: 20px; color: #f5e6e0;">
            New Waitlist Signup 🎉
          </h2>
          <div style="background: #331014; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #a78b7c; text-transform: uppercase; letter-spacing: 0.06em;">Name</p>
            <p style="margin: 0; font-size: 18px; font-weight: 600; color: #ff7a00;">${fullName}</p>
          </div>
          <div style="background: #331014; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #a78b7c; text-transform: uppercase; letter-spacing: 0.06em;">Total Signups</p>
            <p style="margin: 0; font-size: 32px; font-weight: 700; color: #f5e6e0;">${totalSignups}</p>
          </div>
          <p style="font-size: 13px; color: #584235; margin: 0;">
            Check Brevo or your database for full details.
          </p>
        </div>
      `,
    });

    // 3. Add to Brevo contact list
    try {
      await client.contacts.createContact({
        email,
        attributes: {
          FIRSTNAME: fullName.split(" ")[0],
          LASTNAME: fullName.split(" ").slice(1).join(" ") || "",
        },
        listIds: [parseInt(process.env.BREVO_WAITLIST_LIST_ID)],
        updateEnabled: true,
      });
    } catch (contactErr) {
      console.error("Brevo contact error:", contactErr.message);
    }

    return res.status(200).json({ message: "You are on the waitlist!" });
  } catch (err) {
    console.error("Waitlist error:", err.message);

    if (err.message?.includes("unique") || err.message?.includes("duplicate")) {
      return res.status(400).json({ error: "You are already on the waitlist" });
    }

    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again." });
  }
}
