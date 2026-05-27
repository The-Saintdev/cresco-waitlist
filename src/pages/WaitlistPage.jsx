import { useState } from 'react'
import { Zap, MessageSquare, Sparkles, FileText, Check, ArrowRight, X } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import CrescoLogo from '../assets/CrescoLogo.jpg'

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'WhatsApp AI Automation',
    desc: 'AI handles your customer messages 24/7. Reply smarter, close more sales — automatically.',
  },
  {
    icon: Zap,
    title: 'Content Generation',
    desc: 'Captions, scripts, hooks and more. Create viral content in seconds for any platform.',
  },
  {
    icon: Sparkles,
    title: 'AI Image Generation',
    desc: 'Generate social media creatives, ad visuals and product graphics instantly.',
  },
  {
    icon: FileText,
    title: 'Content Repurposing',
    desc: 'Turn one piece of content into 20. Transform voice notes, PDFs and text into multi-platform content.',
  },
]

const BENEFITS = [
  'Test the platform before public launch',
  'Access new features early',
  'Receive important launch updates',
  'Help shape the future of Cresco AI',
]

export default function WaitlistPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSubmit = async () => {
    if (!fullName.trim() || !email.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      await axios.post('/api/waitlist', { fullName, email })
      setJoined(true)
      toast.success('You are on the waitlist!')
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        overflowX: "hidden",
      }}
    >
      {/* NAV */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "clamp(16px, 3vw, 20px) clamp(20px, 5vw, 48px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(41, 8, 12, 0.85)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img
            src={CrescoLogo}
            alt="Cresco AI Logo"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              objectFit: "cover",
            }}
          />
          <span style={{ fontWeight: 700, fontSize: "1.125rem" }}>
            Cresco AI
          </span>
        </div>

        <div className="badge badge-primary">Early Access</div>
      </nav>
      {/* HERO */}
      <section
        style={{
          padding: "clamp(40px, 8vw, 80px) clamp(20px, 5vw, 48px) 60px",
          maxWidth: 1100,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
          gap: "clamp(32px, 5vw, 80px)",
          alignItems: "center",
        }}
      >
        {/* Left */}
        <div>
          <div
            className="label-sm"
            style={{
              color: "var(--primary-container)",
              marginBottom: 20,
              letterSpacing: "0.12em",
            }}
          >
            COMING SOON — JOIN THE WAITLIST
          </div>

          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.25rem)",
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: 24,
              color: "var(--on-surface)",
            }}
          >
            AI Built For
            <br />
            <span
              style={{
                background:
                  "linear-gradient(135deg, var(--primary), var(--primary-container))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              African Businesses & Creators
            </span>
          </h1>

          <p
            style={{
              fontSize: "1rem",
              color: "var(--on-surface-variant)",
              lineHeight: 1.7,
              marginBottom: 40,
              maxWidth: 440,
            }}
          >
            Automate WhatsApp customer replies, generate content, create
            visuals, and repurpose your content — all with AI that understands
            the African market.
          </p>

          {/* Benefits */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 40,
            }}
          >
            {BENEFITS.map((benefit) => (
              <div
                key={benefit}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    background: "rgba(255, 122, 0, 0.15)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Check
                    size={11}
                    color="var(--primary-container)"
                    strokeWidth={3}
                  />
                </div>
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--on-surface-variant)",
                  }}
                >
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div
            style={{
              display: "flex",
              gap: "clamp(20px, 4vw, 40px)",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "50", label: "Beta users selected" },
              { value: "4", label: "Core AI features" },
              { value: "24/7", label: "WhatsApp automation" },
            ].map((stat) => (
              <div key={stat.label}>
                <div
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    marginBottom: 2,
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--on-surface-variant)",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Call To Action Box (Replaces inline form) */}
        <div>
          <div
            style={{
              background: "var(--surface-container)",
              borderRadius: 24,
              padding: 48,
              border: "1px solid rgba(88, 66, 53, 0.3)",
              boxShadow: "var(--shadow-ambient)",
            }}
          >
            <h2
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                marginBottom: 16,
                color: "var(--on-surface)",
              }}
            >
              Ready to transform your business?
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--on-surface-variant)",
                marginBottom: 32,
                lineHeight: 1.6,
              }}
            >
              We will be picking 50 people for our exclusive early access
              program. Join the waitlist now to secure your chance.
            </p>

            <button
              className="btn btn-primary btn-lg"
              onClick={() => setIsModalOpen(true)}
              style={{
                width: "100%",
                justifyContent: "center",
                padding: "16px 24px",
              }}
            >
              Join the Waitlist <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>
      {/* FEATURES */}
      <section
        style={{
          padding: "60px 48px 80px",
          background: "var(--surface-container-lowest)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div
              className="label-sm"
              style={{
                color: "var(--primary-container)",
                marginBottom: 12,
              }}
            >
              WHAT WE'RE BUILDING
            </div>
            <h2 className="headline-md">
              Everything your business needs to grow
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: 24,
            }}
          >
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  style={{
                    background: "var(--surface-container-low)",
                    borderRadius: 16,
                    padding: 28,

                    display: "flex",
                    gap: 20,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      background: "rgba(255, 122, 0, 0.1)",
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={22} color="var(--primary-container)" />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        marginBottom: 6,
                        color: "var(--on-surface)",
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--on-surface-variant)",
                        lineHeight: 1.6,
                      }}
                    >
                      {feature.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      {/* BOTTOM CTA */}
      <section
        style={{
          padding: "80px 48px",
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          <h2 className="headline-md" style={{ marginBottom: 16 }}>
            We're selecting 50 beta users
          </h2>
          <p
            style={{
              color: "var(--on-surface-variant)",
              marginBottom: 32,
              lineHeight: 1.7,
            }}
          >
            We will be picking our first 50 users to shape the future of Cresco
            AI. Don't miss your chance to be part of the beginning.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setIsModalOpen(true)}
          >
            Secure your spot now <ArrowRight size={18} />
          </button>
        </div>
      </section>
      {/* FOOTER */}
      <footer
        style={{
          background: "var(--surface-container-lowest)",
          borderTop: "1px solid rgba(88, 66, 53, 0.2)",
          padding: "clamp(24px, 4vw, 32px) clamp(20px, 5vw, 48px)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img
              src={CrescoLogo}
              alt="Cresco AI Logo"
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                objectFit: "cover",
              }}
            />
            <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>
              Cresco AI
            </span>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {[
              {
                label: "X",
                href: "https://x.com/CrescoAi",
                svg: (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                ),
              },
              {
                label: "Instagram",
                href: "https://www.instagram.com/crescoai.africa/",
                svg: (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                  </svg>
                ),
              },
              {
                label: "YouTube",
                href: "https://www.youtube.com/@CrescoAi",
                svg: (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                ),
              },
              {
                label: "TikTok",
                href: "https://www.tiktok.com/@crescoai?lang=en",
                svg: (
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                ),
              },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                style={{
                  width: 34,
                  height: 34,
                  background: "var(--surface-container)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--on-surface-variant)",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "rgba(255, 122, 0, 0.15)";
                  e.currentTarget.style.color = "var(--primary-container)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "var(--surface-container)";
                  e.currentTarget.style.color = "var(--on-surface-variant)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {social.svg}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            <span
              className="label-sm"
              style={{ color: "var(--on-surface-variant)" }}
            >
              BUILT IN NIGERIA
            </span>
            <span
              style={{
                fontSize: "0.8125rem",
                color: "var(--on-surface-variant)",
              }}
            >
              © 2026 Cresco AI
            </span>
          </div>
        </div>
      </footer>
      {/* MODAL FOR WAITLIST FORM */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(8px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 480,
            }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: "absolute",
                top: 24,
                right: 24,
                background: "transparent",
                border: "none",
                color: "var(--on-surface-variant)",
                cursor: "pointer",
                zIndex: 10,
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <X size={20} />
            </button>

            {joined ? (
              <div
                style={{
                  background: "var(--surface-container)",
                  borderRadius: 24,
                  padding: 48,
                  textAlign: "center",
                  border: "1px solid rgba(255, 122, 0, 0.2)",
                  boxShadow: "var(--glow-primary)",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    background: "rgba(255, 122, 0, 0.15)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 24px",
                  }}
                >
                  <Check
                    size={28}
                    color="var(--primary-container)"
                    strokeWidth={2.5}
                  />
                </div>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  You're on the list!
                </h2>
                <p
                  style={{
                    color: "var(--on-surface-variant)",
                    fontSize: "0.9375rem",
                    lineHeight: 1.6,
                    marginBottom: 24,
                  }}
                >
                  Check your email for a confirmation from Team Cresco AI. We'll
                  reach out with updates and early access details.
                </p>
                <div
                  className="label-sm"
                  style={{ color: "var(--primary-container)" }}
                >
                  BUILT IN NIGERIA. SERVING THE WORLD.
                </div>
              </div>
            ) : (
              <div
                style={{
                  background: "var(--surface-container)",
                  borderRadius: 24,
                  padding: "48px 40px",
                  border: "1px solid rgba(88, 66, 53, 0.3)",
                  boxShadow: "var(--shadow-ambient)",
                }}
              >
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  Join the waitlist
                </h2>
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--on-surface-variant)",
                    marginBottom: 32,
                    lineHeight: 1.6,
                  }}
                >
                  We will be picking 50 people to get early access to Cresco AI.
                </p>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 20 }}
                >
                  <div className="input-wrapper">
                    <label className="input-label">Full Name</label>
                    <input
                      className="input"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="input-wrapper">
                    <label className="input-label">Email Address</label>
                    <input
                      className="input"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={loading}
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      padding: "16px 24px",
                      fontSize: "1rem",
                      marginTop: 8,
                    }}
                  >
                    {loading ? (
                      "Joining..."
                    ) : (
                      <>
                        Join the Waitlist <ArrowRight size={18} />
                      </>
                    )}
                  </button>

                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--on-surface-variant)",
                      textAlign: "center",
                      opacity: 0.7,
                    }}
                  >
                    No spam. Just updates. Unsubscribe anytime.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}