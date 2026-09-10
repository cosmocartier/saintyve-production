export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: "Drops" | "Craft" | "Behind the Scenes" | "Operations" | "Membership" | "Sizing"
  date: string
  readTime: string
  featured: boolean
  image?: string
}

export const POSTS: BlogPost[] = [
  {
    slug: "inside-the-workshop-finishing-details",
    title: "Inside the Workshop: Finishing Details",
    excerpt: "A look at the small touches that separate good pieces from exceptional ones.",
    category: "Craft",
    date: "2025-01-15",
    readTime: "5 min",
    featured: true,
    image: "/luxury-workshop-craftsmanship-details.jpg",
  },
  {
    slug: "how-we-think-about-quality-checks",
    title: "How We Think About Quality Checks",
    excerpt: "Every piece goes through multiple checkpoints before it reaches you. Here's why that matters.",
    category: "Operations",
    date: "2025-01-12",
    readTime: "4 min",
    featured: false,
    image: "/quality-control-inspection.png",
  },
  {
    slug: "monthly-rewards-how-platinum-works",
    title: "Monthly Rewards: How Platinum Works",
    excerpt: "Understanding the benefits, tiers, and how to make the most of your membership.",
    category: "Membership",
    date: "2025-01-10",
    readTime: "6 min",
    featured: false,
    image: "/platinum-membership-card-luxury.jpg",
  },
  {
    slug: "drop-notes-whats-new-this-month",
    title: "Drop Notes: What's New This Month",
    excerpt: "Fresh additions to the collection and what makes each piece worth considering.",
    category: "Drops",
    date: "2025-01-08",
    readTime: "3 min",
    featured: false,
    image: "/new-fashion-drops-collection.jpg",
  },
  {
    slug: "packaging-the-small-details-that-matter",
    title: "Packaging: The Small Details That Matter",
    excerpt: "From box to bag, how we think about the unboxing experience.",
    category: "Craft",
    date: "2025-01-05",
    readTime: "4 min",
    featured: false,
    image: "/premium-packaging-luxury-box.jpg",
  },
  {
    slug: "operations-update-faster-processing",
    title: "Operations Update: Faster Processing",
    excerpt: "Recent improvements to our fulfillment process and what that means for delivery times.",
    category: "Operations",
    date: "2025-01-03",
    readTime: "3 min",
    featured: false,
    image: "/warehouse-operations-logistics.jpg",
  },
  {
    slug: "craft-focus-materials-and-care",
    title: "Craft Focus: Materials & Care",
    excerpt: "Understanding leather grades, fabric weights, and how to maintain your pieces.",
    category: "Craft",
    date: "2024-12-28",
    readTime: "7 min",
    featured: false,
    image: "/leather-material-texture-close-up.jpg",
  },
  {
    slug: "behind-the-scenes-production-footage",
    title: "Behind the Scenes: Production Footage",
    excerpt: "A rare look at how your pieces are made from start to finish.",
    category: "Behind the Scenes",
    date: "2024-12-25",
    readTime: "5 min",
    featured: false,
    image: "/fashion-production-behind-scenes.jpg",
  },
  {
    slug: "sizing-notes-finding-the-right-fit",
    title: "Sizing Notes: Finding the Right Fit",
    excerpt: "Tips for choosing the right size across different brands and silhouettes.",
    category: "Sizing",
    date: "2024-12-22",
    readTime: "6 min",
    featured: false,
    image: "/clothing-fit-sizing-guide.jpg",
  },
  {
    slug: "why-clean-product-pages-convert",
    title: "Why Clean Product Pages Convert",
    excerpt: "Less noise, more focus. How we design product pages to help you make confident decisions.",
    category: "Operations",
    date: "2024-12-20",
    readTime: "4 min",
    featured: false,
    image: "/minimal-clean-product-page-design.jpg",
  },
]
