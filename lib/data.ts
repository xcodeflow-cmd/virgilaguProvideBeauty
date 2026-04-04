export const siteConfig = {
  name: "Tudor Noir Studio",
  slogan: "Precision grooming. Broadcast like a luxury brand.",
  description:
    "A premium barber platform blending high-end grooming, members-only live education, and cinematic presentation.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  socials: {
    instagram: "https://instagram.com",
    tiktok: "https://tiktok.com",
    whatsapp: "https://wa.me/40700000000",
    phone: "tel:+40700000000"
  }
};

export const services = [
  {
    name: "Executive Fade",
    description: "Consultation, skin fade architecture, hot towel finish.",
    price: "from 150 RON"
  },
  {
    name: "Signature Beard Sculpt",
    description: "Structured beard shaping with razor detailing and treatment.",
    price: "from 90 RON"
  },
  {
    name: "Private Transformation",
    description: "Look refresh session for events, content shoots, or personal branding.",
    price: "from 280 RON"
  }
];

export const subscriptionPlans = [
  {
    name: "Live Club",
    price: "EUR 19 / month",
    description: "Full access to live sessions, past recordings, and premium drops.",
    features: [
      "Unlimited live stream access",
      "Replay archive",
      "Priority Q&A on live sessions",
      "Members-only grooming notes"
    ]
  },
  {
    name: "Single Session",
    price: "from EUR 15",
    description: "Unlock individual masterclasses without a recurring plan.",
    features: [
      "One-time access",
      "Per-session ownership",
      "Perfect for occasional viewers"
    ]
  }
];
