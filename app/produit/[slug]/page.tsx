import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug, getProducts, getProductImageUrl } from "@/lib/api/products";
import ProductDetails from "./ProductDetails";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    return {
      title: 'Produit non trouvé',
    };
  }

  const productImage = getProductImageUrl(product.image_url);
  const title = `${product.name} - Cocktail Artisanal`;
  const description = `Découvrez ${product.name}, cocktail artisanal de L'invisible à Bordeaux. ${product.description} Prix: ${product.price}€. Commandez en ligne.`;

  return {
    title,
    description,
    keywords: [
      product.name.toLowerCase(),
      'cocktail artisanal',
      'cocktail bordeaux',
      'cocktail prêt à boire',
      'mixologie',
      `cocktail ${product.price}€`
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://www.cocktails-linvisible.fr/produit/${product.slug}`,
      images: [{
        url: productImage,
        width: 800,
        height: 800,
        alt: `${product.name} - Cocktail artisanal L'invisible`,
      }],
      siteName: "L'invisible",
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [productImage],
    },
    alternates: {
      canonical: `https://www.cocktails-linvisible.fr/produit/${product.slug}`,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  
  if (!product) {
    notFound();
  }

  const allProducts = await getProducts();
  const otherProducts = allProducts
    .filter(p => p.id !== product.id)
    .slice(0, 3)
    .map(p => ({
      ...p,
      image: getProductImageUrl(p.image_url)
    }));

  return (
    <ProductDetails 
      product={{
        ...product,
        image: getProductImageUrl(product.image_url)
      }} 
      otherProducts={otherProducts} 
    />
  );
}