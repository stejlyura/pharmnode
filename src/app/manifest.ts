import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PharmNode - Pharmaceutical Calculation SaaS',
    short_name: 'PharmNode',
    description: 'Advanced platform for pharmaceutical formulations, tablet tooling geometry, and cost optimization.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#05e69f',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
