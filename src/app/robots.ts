import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pharmnode.com'

  return {
    rules: [
      {
        userAgent: [
          'OAI-SearchBot',
          'Claude-SearchBot',
          'PerplexityBot',
          'ChatGPT-User',
          'GPTBot',
          'ClaudeBot'
        ],
        allow: '/',
        disallow: ['/api/', '/admin/', '/projects/', '/configurator/', '/settings/'],
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/projects/', '/configurator/', '/settings/'],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
