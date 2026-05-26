import { BrevoClient } from "@getbrevo/brevo";

// Load env manually (since this is a standalone script)
const BREVO_API_KEY = process.env.BREVO_API_KEY || "YOUR_BREVO_API_KEY";
const BREVO_SENDER_EMAIL = "crescoai.africa@gmail.com";
const BREVO_SENDER_NAME = "Cresco AI";

// ✏️ Change this to YOUR personal email to receive the test
const TEST_RECIPIENT_EMAIL = "crescoai.africa@gmail.com";
const TEST_RECIPIENT_NAME = "Test User";

async function testBrevo() {
  console.log("🔍 Testing Brevo connection...\n");

  try {
    const client = new BrevoClient({ apiKey: BREVO_API_KEY });

    const result = await client.transactionalEmails.sendTransacEmail({
      sender: {
        name: BREVO_SENDER_NAME,
        email: BREVO_SENDER_EMAIL,
      },
      to: [{ email: TEST_RECIPIENT_EMAIL, name: TEST_RECIPIENT_NAME }],
      subject: "✅ Brevo Test — Cresco AI Waitlist",
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #1a1a1a; color: #f5f5f5; border-radius: 12px;">
          <h2 style="color: #ff7a00;">✅ Brevo is working!</h2>
          <p style="color: #ccc;">This is a test email from the <strong>Cresco AI Waitlist</strong> project.</p>
          <p style="color: #ccc;">If you received this, your Brevo API key and sender email are configured correctly.</p>
          <hr style="border-color: #333; margin: 24px 0;" />
          <p style="font-size: 12px; color: #666;">Sent at: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    console.log("✅ SUCCESS! Email sent.");
    console.log("   Message ID:", result?.messageId || result?.body?.messageId || "(see Brevo dashboard)");
    console.log(`   Sent to: ${TEST_RECIPIENT_EMAIL}`);
    console.log("\n🎉 Brevo is fully working. You're good to go!\n");

  } catch (err) {
    console.error("❌ FAILED — Brevo error:");
    console.error("   Status:", err.status || err.statusCode || "unknown");
    console.error("   Message:", err.message);

    if (err.response?.body) {
      console.error("   Details:", JSON.stringify(err.response.body, null, 2));
    }

    console.log("\n💡 Common fixes:");
    console.log("   • Make sure your BREVO_API_KEY is correct and active");
    console.log("   • Verify your sender email is approved in Brevo (Senders & Domains)");
    console.log("   • Check that transactional emails are enabled on your Brevo plan\n");
    process.exit(1);
  }
}

testBrevo();
