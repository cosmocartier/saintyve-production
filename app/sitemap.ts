import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://designerdrip.store'

  // Main pages
  const mainPages = [
    '',
    '/new-arrivals',
    '/all',
    '/sneakers',
    '/bags',
    '/watches',
    '/jackets',
    '/vests',
    '/jewelry',
    '/accessories',
  ]

  // Brand pages
  const brandPages = [
    '/brands',
    '/brands/adidas',
    '/brands/air-jordan',
    '/brands/alexander-mcqueen',
    '/brands/balenciaga',
    '/brands/bottega-veneta',
    '/brands/canada-goose',
    '/brands/cartier',
    '/brands/celine',
    '/brands/cesare-paciotti',
    '/brands/chanel',
    '/brands/chrome-hearts',
    '/brands/dior',
    '/brands/ferregamo',
    '/brands/givenchy',
    '/brands/goyard',
    '/brands/gucci',
    '/brands/jimmy-cho',
    '/brands/hermes',
    '/brands/lanvin',
    '/brands/louis-vuitton',
    '/brands/maison-mihara',
    '/brands/miumiu',
    '/brands/moncler',
    '/brands/nike-nocta',
    '/brands/prada',
    '/brands/rimowa',
    '/brands/rolex',
    '/brands/valentino-garavani',
    '/brands/van-cleef',
    '/brands/yves-saint-laurent',
  ]

  // Men's pages
  const mensPages = [
    '/mens',
    '/mens/outerwear',
    '/mens/outerwear/puffer-jackets',
    '/mens/outerwear/down-jackets',
    '/mens/outerwear/bomber-jackets',
    '/mens/outerwear/leather-jackets',
    '/mens/outerwear/windbreaker',
    '/mens/outerwear/parka',
    '/mens/outerwear/vests',
    '/mens/shoes',
    '/mens/shoes/sneakers',
    '/mens/shoes/loafers',
    '/mens/shoes/boots',
    '/mens/shoes/slides',
    '/mens/shoes/sandals',
    '/mens/shoes/dress-shoes',
    '/mens/shoes/trainers',
    '/mens/bags/duffel-bags',
    '/mens/bags/travel-bags',
    '/mens/bags/crossbody-bags',
    '/mens/bags/backpacks',
    '/mens/bags/wallets',
    '/mens/bags/tote-bags',
    '/mens/bags/briefcases',
    '/mens/accessories/belts',
    '/mens/accessories/sunglasses',
    '/mens/accessories/hats-caps',
    '/mens/accessories/scarves',
    '/mens/accessories/cardholders',
    '/mens/accessories/jewelry',
    '/mens/accessories/tech-accessories',
  ]

  // Women's pages
  const womensPages = [
    '/womens',
    '/womens/outerwear',
    '/womens/outerwear/puffer-jackets',
    '/womens/outerwear/down-jackets',
    '/womens/outerwear/bomber-jackets',
    '/womens/outerwear/leather-jackets',
    '/womens/outerwear/trench-coats',
    '/womens/outerwear/wool-coats',
    '/womens/outerwear/parkas',
    '/womens/shoes',
    '/womens/shoes/heels',
    '/womens/shoes/loafers',
    '/womens/shoes/boots',
    '/womens/shoes/sandals',
    '/womens/shoes/flats',
    '/womens/shoes/sneakers',
    '/womens/shoes/trainers',
    '/womens/bags/shoulder-bags',
    '/womens/bags/tote-bags',
    '/womens/bags/crossbody-bags',
    '/womens/bags/mini-bags',
    '/womens/bags/top-handle-bags',
    '/womens/bags/travel-bags',
    '/womens/bags/wallets',
    '/womens/accessories/belts',
    '/womens/accessories/sunglasses',
    '/womens/accessories/hats-caps',
    '/womens/accessories/scarves',
    '/womens/accessories/jewelry',
    '/womens/accessories/hair-accessories',
    '/womens/accessories/tech-accessories',
  ]

  // Content and legal pages
  const contentPages = [
    '/about-us',
    '/mission',
    '/careers',
    '/press',
    '/blog',
    '/size-guide',
    '/care-guide',
    '/faq',
    '/privacy-policy',
    '/terms-of-service',
    '/cookie-policy',
  ]

  // Combine all pages
  const allPages = [
    ...mainPages,
    ...brandPages,
    ...mensPages,
    ...womensPages,
    ...contentPages,
  ]

  // Generate sitemap entries
  return allPages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: page === '' ? 1.0 : page.startsWith('/blog') ? 0.8 : 0.7,
  }))
}
