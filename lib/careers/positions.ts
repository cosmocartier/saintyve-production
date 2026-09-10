export interface Position {
  id: string
  title: string
  department: "Ops" | "Support" | "Product" | "Growth" | "Creative" | "Vendor Ops" | "Engineering"
  location: "Remote" | "Dubai" | "Hybrid"
  type: "Contract" | "Part-time" | "Full-time"
  summary: string
  responsibilities: string[]
  requirements: string[]
  niceToHaves: string[]
}

export const POSITIONS: Position[] = [
  {
    id: "operations-logistics-coordinator",
    title: "Operations & Logistics Coordinator",
    department: "Ops",
    location: "Remote",
    type: "Full-time",
    summary: "Manage daily order flow, supplier coordination, tracking, and exception handling.",
    responsibilities: [
      "Process and route daily orders to suppliers, ensuring SLA adherence",
      "Monitor tracking updates and proactively communicate delays to customers",
      "Handle exceptions (lost packages, returns, damaged items) with urgency and professionalism",
      "Coordinate with suppliers on lead times, inventory availability, and QC checkpoints",
      "Maintain clean logs and dashboards for order status and supplier performance",
    ],
    requirements: [
      "2+ years in operations, logistics, or supply chain coordination",
      "Strong organizational skills and attention to detail",
      "Comfortable with spreadsheets, dashboards, and order management tools",
      "Calm under pressure, able to escalate issues appropriately",
      "Excellent written communication",
    ],
    niceToHaves: [
      "Experience with e-commerce fulfillment or 3PL coordination",
      "Familiarity with Supabase, Notion, or similar tools",
      "Fashion or luxury goods background",
    ],
  },
  {
    id: "customer-support-concierge",
    title: "Customer Support Concierge",
    department: "Support",
    location: "Remote",
    type: "Full-time",
    summary: "Deliver high-status, calm support across email, chat, and occasional phone inquiries.",
    responsibilities: [
      "Manage customer inbox (orders, sizing, returns, membership questions) with a premium tone",
      "Handle refunds, exchanges, and issue resolutions with empathy and efficiency",
      "Proactively follow up on delayed shipments and notify customers of tracking updates",
      "Escalate complex cases (fraud, supplier issues, VIP requests) to leadership",
      "Document recurring issues and contribute to FAQ and knowledge base improvements",
    ],
    requirements: [
      "1+ years in customer support, preferably e-commerce or luxury retail",
      "Exceptional written communication — concise, calm, high-status tone",
      "Comfortable handling refunds, complaints, and difficult conversations",
      "Self-starter who can manage inbox independently and prioritize urgent cases",
      "Available for flexible hours to cover peak support windows",
    ],
    niceToHaves: [
      "Experience with Zendesk, Intercom, or similar support platforms",
      "Fashion or luxury goods knowledge",
      "Multilingual (French, Arabic, or Spanish)",
    ],
  },
  {
    id: "supplier-production-liaison",
    title: "Supplier & Production Liaison",
    department: "Vendor Ops",
    location: "Hybrid",
    type: "Full-time",
    summary: "Coordinate production schedules, QC expectations, and supplier relationships.",
    responsibilities: [
      "Communicate daily with suppliers on order status, lead times, and production capacity",
      "Set and enforce quality control standards, escalating failures immediately",
      "Negotiate pricing, MOQs, and delivery terms while maintaining quality benchmarks",
      "Onboard new suppliers and conduct trial orders with detailed QC feedback",
      "Track supplier performance metrics (on-time delivery, defect rates, responsiveness)",
    ],
    requirements: [
      "3+ years in sourcing, procurement, or supplier management",
      "Strong negotiation and relationship-building skills",
      "Comfortable traveling occasionally for supplier visits and QC inspections",
      "Fluent in English; Mandarin or Cantonese is a strong plus",
      "Detail-oriented with a no-compromise attitude toward quality",
    ],
    niceToHaves: [
      "Fashion production or manufacturing background",
      "Experience working with Asian suppliers (China, Vietnam, Turkey)",
      "Knowledge of garment construction, materials, and finishing techniques",
    ],
  },
  {
    id: "product-catalog-manager",
    title: "Product Catalog Manager",
    department: "Product",
    location: "Remote",
    type: "Part-time",
    summary: "Maintain product entries, attributes, SEO fields, and imagery consistency.",
    responsibilities: [
      "Create and update product listings with accurate titles, descriptions, and attributes",
      "Ensure imagery is consistent, high-quality, and properly tagged",
      "Manage product variants (sizes, colors) and inventory sync with suppliers",
      "Optimize product SEO fields (meta descriptions, tags, categories) for discoverability",
      "Audit existing catalog for errors, missing data, and outdated listings",
    ],
    requirements: [
      "1+ years in e-commerce product management or catalog operations",
      "Strong attention to detail and data hygiene practices",
      "Comfortable with Shopify, Supabase, or similar platforms",
      "Basic understanding of SEO best practices",
      "Self-directed and able to work independently",
    ],
    niceToHaves: [
      "Fashion or luxury goods knowledge",
      "Experience with image editing tools (Photoshop, Figma)",
      "Copywriting skills for product descriptions",
    ],
  },
  {
    id: "content-editor-reels-stories",
    title: "Content Editor (Reels / Stories)",
    department: "Creative",
    location: "Remote",
    type: "Contract",
    summary: "Edit short-form content from production footage for consistent brand storytelling.",
    responsibilities: [
      "Edit 5–7 short-form videos per week (Reels, TikToks, Stories) from raw production footage",
      "Maintain visual consistency with brand aesthetic (minimal, premium, editorial tone)",
      "Add captions, music, and motion graphics where appropriate",
      "Collaborate with creative lead on content calendar and posting schedule",
      "Test formats, pacing, and hooks to maximize engagement and conversions",
    ],
    requirements: [
      "2+ years editing short-form video content (CapCut, Premiere, Final Cut)",
      "Strong understanding of social media trends and platform-specific formats",
      "Portfolio showcasing clean, premium, editorial-style edits",
      "Reliable turnaround time (24–48h per batch)",
      "Self-directed and able to follow brand guidelines without heavy oversight",
    ],
    niceToHaves: [
      "Fashion or lifestyle content experience",
      "Motion graphics skills (After Effects)",
      "Experience running paid social campaigns or creative testing",
    ],
  },
  {
    id: "performance-marketer-meta-tiktok",
    title: "Performance Marketer (Meta/TikTok)",
    department: "Growth",
    location: "Remote",
    type: "Contract",
    summary: "Run creative testing loops, optimize campaigns, and refine conversion funnels.",
    responsibilities: [
      "Manage Meta and TikTok ad accounts with focus on ROAS and CAC",
      "Test creative hooks, offers, and landing page variants systematically",
      "Analyze campaign performance and provide feedback to creative and product teams",
      "Set up and monitor tracking pixels, UTM parameters, and attribution funnels",
      "Scale winning campaigns while maintaining profitability thresholds",
    ],
    requirements: [
      "2+ years running paid social campaigns (Meta, TikTok, or similar platforms)",
      "Strong grasp of performance metrics (CTR, CVR, ROAS, LTV:CAC)",
      "Comfortable with rapid testing cycles and data-driven decision-making",
      "Self-sufficient with Ads Manager, analytics tools, and dashboards",
      "Clear communication when reporting results and recommendations",
    ],
    niceToHaves: [
      "E-commerce or DTC brand experience",
      "Google Analytics, Klaviyo, or Northbeam familiarity",
      "Fashion or luxury goods audience knowledge",
    ],
  },
  {
    id: "full-stack-engineer-nextjs-supabase",
    title: "Full-Stack Engineer (Next.js / Supabase)",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    summary: "Build features, optimize performance, and maintain platform stability.",
    responsibilities: [
      "Develop and ship new features across the Next.js + Supabase stack",
      "Optimize page load times, API performance, and database indexing",
      "Build internal dashboards and automation tools for ops and support teams",
      "Debug production issues, monitor logs, and maintain uptime SLAs",
      "Collaborate with leadership on roadmap priorities and technical feasibility",
    ],
    requirements: [
      "3+ years full-stack development experience (React, Next.js, Node.js)",
      "Strong proficiency with Supabase (or Postgres) and API design",
      "Comfortable with Vercel deployments, CI/CD, and monitoring tools",
      "Ownership mentality — you ship clean, tested, reliable code",
      "Clear communicator who can explain technical tradeoffs to non-technical stakeholders",
    ],
    niceToHaves: [
      "E-commerce platform experience",
      "Experience with payment gateways (Stripe, PayPal)",
      "DevOps skills (Docker, GitHub Actions, alerting systems)",
    ],
  },
]
