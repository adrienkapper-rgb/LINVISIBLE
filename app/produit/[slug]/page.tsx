import { notFound } from "next/navigation";
import { getProductBySlug, getProducts, getProductImageUrl } from "@/lib/api/products";
import ProductDetails from "./ProductDetails";

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