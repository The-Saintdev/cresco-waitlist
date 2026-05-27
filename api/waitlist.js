import { sql } from "@vercel/postgres";
import { BrevoClient } from "@getbrevo/brevo";

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const { fullName, email } = req.body;

    // Validation
    if (!fullName || !email) {
      return res.status(400).json({
        error: "Name and email are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        error: "Invalid email address",
      });
    }

    // Create table
    await sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(150) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Check existing user
    const existing = await sql`
      SELECT id FROM waitlist
      WHERE email = ${cleanEmail}
    `;

    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: "You are already on the waitlist",
      });
    }

    // Insert user
    await sql`
      INSERT INTO waitlist (full_name, email)
      VALUES (${cleanName}, ${cleanEmail})
    `;

    // Get total signup count
    const countResult = await sql`
      SELECT COUNT(*) as total FROM waitlist
    `;

    const totalSignups = countResult.rows[0].total;

    /*
      ============================================
      SEND CONFIRMATION EMAIL
      ============================================
    */

    try {
      await client.transactionalEmails.sendTransacEmail({
        sender: {
          name: process.env.BREVO_SENDER_NAME || "Team Cresco AI",
          email: process.env.BREVO_SENDER_EMAIL,
        },

        to: [
          {
            email: cleanEmail,
            name: cleanName,
          },
        ],

        subject: "Welcome to the Cresco AI Early Access Waitlist",

        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 32px; background: #29080c; color: #f5e6e0;">
            <h1>Welcome to Cresco AI ⚡</h1>

            <p>Hey ${cleanName},</p>

            <p>
              You're officially on the Cresco AI early access waitlist.
            </p>

            <p>
              Cresco AI helps businesses automate WhatsApp customer replies
              and helps creators generate content faster using AI.
            </p>

            <p>
              We'll send you updates, launch announcements and early access details soon.
            </p>

            <br />

            <p>— Team Cresco AI</p>
          </div>
        `,
      });

      console.log("Confirmation email sent:", cleanEmail);
    } catch (emailErr) {
      console.error("Confirmation email failed:", emailErr);
    }

    /*
      ============================================
      SEND ADMIN NOTIFICATION
      ============================================
    */

    try {
      await client.transactionalEmails.sendTransacEmail({
        sender: {
          name: "Cresco AI Waitlist",
          email: process.env.BREVO_SENDER_EMAIL,
        },

        to: [
          {
            email: process.env.NOTIFY_EMAIL,
            name: "Cresco Team",
          },
        ],

        subject: `🎉 New waitlist signup — ${cleanName}`,

        htmlContent: `
          <div style="font-family: Arial, sans-serif; padding: 24px;">
            <h2>New Waitlist Signup</h2>

            <p><strong>Name:</strong> ${cleanName}</p>
            <p><strong>Email:</strong> ${cleanEmail}</p>
            <p><strong>Total Signups:</strong> ${totalSignups}</p>
          </div>
        `,
      });

      console.log("Admin notification sent");
    } catch (notifyErr) {
      console.error("Admin notification failed:", notifyErr);
    }

    /*
      ============================================
      ADD TO BREVO CONTACT LIST
      ============================================
    */

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

      console.log("Contact added to Brevo");
    } catch (contactErr) {
      console.error("Brevo contact creation failed:", contactErr);
    }

    /*
      ============================================
      SUCCESS RESPONSE
      ============================================
    */

    return res.status(200).json({
      success: true,
      message: "You are on the waitlist!",
    });
  } catch (err) {
    console.error("Waitlist API fatal error:", err);

    if (err.message?.includes("duplicate") || err.message?.includes("unique")) {
      return res.status(400).json({
        error: "You are already on the waitlist",
      });
    }

    return res.status(500).json({
      error: "Something went wrong. Please try again.",
    });
  }
}
