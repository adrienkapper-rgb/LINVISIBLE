import { getProducts } from '@/lib/api/products';

export async function GET() {
  const baseUrl = 'https://www.cocktails-linvisible.fr';
  const products = await getProducts();
  
  // Pages statiques
  const staticPages = [
    '',
    '/boutique',
    '/contact',
    '/cgv',
    '/mentions-legales',
    '/confidentialite',
  ];
  
  // Générer XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page === '' ? 'weekly' : 'monthly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
${products.map(product => `  <url>
    <loc>${baseUrl}/produit/${product.slug}</loc>
    <lastmod>${new Date(product.updated_at || product.created_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`).join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 's-maxage=86400, stale-while-revalidate',
    },
  });
}