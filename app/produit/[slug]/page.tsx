import { notFound } from "next/navigation";
import { getProductBySlug, getProducts, getProductImageUrl } from "@/lib/api/products";
import ProductDetails from "./ProductDetails";

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  
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