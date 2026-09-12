export type LoyaltyStatus = "bronze" | "silver" | "gold" | "platinum" | "black"

export const LOYALTY_TIERS: Record<
  LoyaltyStatus,
  {
    label: string
    description: string
    imageSrc: string
    accentColor: string
    price: string
    value: string
    benefits: string[]
  }
> = {
  bronze: {
    label: "Bronze Edition Membership Card",
    description: "Your journey has just begun. Enjoy essential access to core Saint Yve benefits.",
    imageSrc: "/images/bronze-20edition.png",
    accentColor: "#CD7F32",
    price: "Free",
    value: "Starter access",
    benefits: ["Basic product access", "Standard shipping", "Email support"],
  },
  silver: {
    label: "Silver Edition Membership Card",
    description: "You're leveling up. Faster handling and improved support awaits.",
    imageSrc: "/images/silver-20edition.png",
    accentColor: "#C0C0C0",
    price: "199 €",
    value: "Estimated value: 350 €",
    benefits: ["Priority support", "Faster processing", "Early access to drops"],
  },
  gold: {
    label: "Gold Edition Membership Card",
    description: "Experience elevated service, premium priority sourcing and faster processing.",
    imageSrc: "/images/gold-20edition.png",
    accentColor: "#FFD700",
    price: "349 €",
    value: "Estimated value: 500 €",
    benefits: ["VIP support line", "Express shipping included", "Exclusive products"],
  },
  platinum: {
    label: "Platinum Edition Membership Card",
    description: "Reserved for the few who demand the highest level of service and attention.",
    imageSrc: "/images/platinum-card.png",
    accentColor: "#1a1a1a",
    price: "499 €",
    value: "Estimated value: 1.000 €",
    benefits: ["24/7 dedicated concierge", "White-glove service", "Private sale access"],
  },
  black: {
    label: "Black Edition Membership Card",
    description: "The pinnacle of luxury. Ultra-exclusive access reserved for Saint Yve elite.",
    imageSrc: "/images/black.png",
    accentColor: "#000000",
    price: "999 €",
    value: "Estimated value: 3.000–4.000 €",
    benefits: ["Personal styling consultation", "Ultra-priority sourcing", "Lifetime benefits"],
  },
}

export const ORDERED_TIERS: LoyaltyStatus[] = ["bronze", "silver", "gold", "platinum", "black"]
