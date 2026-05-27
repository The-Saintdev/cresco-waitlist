import { sql } from "@vercel/postgres";
import { BrevoClient } from "@getbrevo/brevo";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fullName, email } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  try {
    // Save to database
    await sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Check if already on waitlist
    const existing = await sql`
      SELECT id FROM waitlist WHERE email = ${email}
    `;

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "You are already on the waitlist" });
    }

    await sql`
      INSERT INTO waitlist (full_name, email)
      VALUES (${fullName}, ${email})
    `;

    // Send confirmation email via Brevo
    const client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY });

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
            <div style="display: inline-flex; align-items: center; gap: 8px; background: #ff7a00; padding: 8px 12px; border-radius: 8px;">
              <span style="font-weight: 700; font-size: 16px; color: #321200;">⚡ Cresco AI</span>
            </div>
          </div>

          <h1 style="font-size: 28px; font-weight: 700; margin-bottom: 8px; color: #f5e6e0;">
            Hey ${fullName},
          </h1>
          
          <h2 style="font-size: 20px; font-weight: 600; color: #ff7a00; margin-bottom: 24px;">
            Welcome to Cresco AI.
          </h2>

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
            <p style="font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #ff7a00; margin-bottom: 16px;">
              As an early waitlist member, you'll be among the first to:
            </p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${[
                "Test the platform before public launch",
                "Access new features early",
                "Receive important launch updates",
                "Help shape the future of Cresco AI through feedback",
              ]
                .map(
                  (item) => `
                <div style="display: flex; align-items: flex-start; gap: 10px;">
                  <span style="color: #ff7a00; font-size: 16px; line-height: 1.4;">✓</span>
                  <span style="font-size: 14px; color: #e0c0af; line-height: 1.5;">${item}</span>
                </div>
              `,
                )
                .join("")}
            </div>
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
            <p style="font-size: 14px; color: #a78b7c; margin: 0;">
              — Team Cresco AI
            </p>
            <p style="font-size: 12px; color: #584235; margin-top: 8px;">
              Built in Nigeria. Serving the world.
            </p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({
      message: "You are on the waitlist!",
    });
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
