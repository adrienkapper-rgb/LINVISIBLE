import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getProductBySlug, getProductImageUrl } from "@/lib/api/products";
import { getProductTitle, getProductDescription, getProductImageAlt } from "@/lib/utils/product";
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
  const title = getProductTitle(product.numero, product.name);
  const description = getProductDescription(product.numero, product.name, product.description, product.price);

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
        alt: getProductImageAlt(product.numero, product.name),
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

  return (
    <ProductDetails
      product={{
        ...product,
        image: getProductImageUrl(product.image_url)
      }}
    />
  );
}