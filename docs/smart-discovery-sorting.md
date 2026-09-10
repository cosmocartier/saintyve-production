# Smart Discovery Sorting Algorithm

## Overview

The `/all` page now features a sophisticated, conversion-optimized discovery sorting system that is distinct from the chronological `/new-arrivals` page. This algorithm creates a dynamic, engaging product order that feels fresh, surfaces high-performing products, and maximizes product discovery.

## Key Differences from New Arrivals

- **New Arrivals**: Strictly chronological (newest first)
- **All Items (Recommended)**: Multi-signal algorithmic sorting with diversity mixing

## Algorithm Components

### 1. Sales Performance Score (Logarithmic)
\`\`\`
salesScore = log(salesCount + 1) * 3
\`\`\`
- Uses order history to identify proven products
- Logarithmic scaling prevents top sellers from completely dominating
- Only counts orders with status: paid, processing, preparing, in_transit, shipped, delivered

### 2. Recency Boost (14-day window)
\`\`\`
recencyBoost = (14 - daysSinceCreated) / 14 * 5  (if < 14 days old)
\`\`\`
- Products less than 14 days old receive a temporary boost
- Gradually decreases as product ages
- Helps new products gain visibility without completely overtaking proven items

### 3. Badge Boosts
- **Bestseller Badge**: +2 points
- **New In Badge**: +1 point
- Manual curation signals that complement algorithmic signals

### 4. Price Variety Score
\`\`\`
priceScore = 0.5  (if price between $50-$200)
\`\`\`
- Slight preference for mid-range items
- Ensures variety across price tiers in the feed

### 5. Random Freshness Factor
\`\`\`
randomFactor = random(0, 1.5)
\`\`\`
- Adds controlled unpredictability
- Prevents feed from becoming completely static
- Keeps the experience fresh on repeat visits

### 6. Diversity Mixing Layer

After scoring products, a second-pass diversity algorithm ensures:

#### Brand Diversity
- Recent brands tracked (last 5 products)
- Penalty applied if brand was recently shown
- Prevents clustering of same-brand items

#### Category Diversity
- Recent sub-categories tracked (last 5 products)
- Penalty applied for category repetition
- Creates a more varied browsing experience

#### Price Tier Diversity
Price tiers:
- Budget: < $50
- Mid-Low: $50-$100
- Mid-High: $100-$200
- Premium: > $200

Ensures different price points are interspersed throughout the grid.

## Scoring Formula

\`\`\`
discoveryScore = salesScore + recencyBoost + bestsellerBoost + newInBoost + priceScore + randomFactor

diversityScore = brandDiversity * 0.3 + categoryDiversity * 0.2 + priceTierDiversity * 0.1

finalScore = discoveryScore * 0.7 + diversityScore * 0.3
\`\`\`

## Implementation Details

### Server-Side (Initial Load)
- Fetches 3x the requested products (60 instead of 20)
- Applies full algorithm including diversity mixing
- Returns top 20 products based on combined scores

### Client-Side (Infinite Scroll)
- Uses server action `getSmartSortedProducts`
- Fetches 2x requested products for better diversity options
- Maintains same algorithm consistency throughout scroll

### Filter Compatibility
- Works seamlessly with brand, subcategory, color, and style filters
- Recalculates scores within filtered subset
- Maintains diversity principles even with limited products

## Performance Optimization

- Sales data queried only once per request
- Cloudflare image optimization integrated
- Efficient Map-based lookups for O(1) access
- Diversity algorithm limited to top 10 candidates per position

## Expected Outcomes

1. **Fresh Experience**: Random element + diversity mixing = different order on each visit
2. **Discovery**: Lesser-known products get visibility alongside bestsellers
3. **Conversion**: High-performing products naturally rise but don't dominate
4. **Engagement**: Varied brands, categories, and price points keep browsing interesting
5. **Non-Repetitive**: Distinct from /new-arrivals chronological ordering

## Future Enhancements

Potential additions to the algorithm:
- User behavior signals (clicks, time on page)
- Stock level urgency (low stock boost)
- Seasonal relevance scoring
- User preference learning (personalization)
- A/B testing framework for score weight optimization
