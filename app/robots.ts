import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/checkout',
        '/account',
        '/wishlist',
        '/cart',
        '/login',
        '/register',
        '/search',
        '/api',
        '/admin',
        '/*?*', // Block URL parameters
      ],
    },
    sitemap: 'https://designerdrip.store/sitemap.xml',
  }
}
