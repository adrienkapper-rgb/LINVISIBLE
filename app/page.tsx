import { Suspense } from "react";
import Image from "next/image";
import { ProductCard } from "@/components/ProductCard";
import { getProducts, getProductImageUrl } from "@/lib/api/products";
import { getHeroImageUrl } from "@/lib/api/interface";
import { mapProductRowToCardData } from "@/lib/utils/product";
import { ProductGridSkeleton } from "@/components/skeletons/ProductGridSkeleton";
import { AgeVerificationWrapper } from "@/components/AgeVerificationWrapper";

async function HeroSection() {
  const heroImageUrl = await getHeroImageUrl();

  return (
    <section className="relative w-full h-[50vh]">
      {/* Background Image */}
      <Image
        src={heroImageUrl}
        alt="L'invisible - Cocktails artisanaux"
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
        quality={90}
      />

      {/* Dark Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />

      {/* Text Overlay - Centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="container px-4">
          <div className="text-center">
            <h1
              className="text-7xl md:text-9xl font-serif mb-4 text-white drop-shadow-lg"
            >
              Cocktails L'invisible
            </h1>
            <p
              className="text-3xl md:text-4xl text-white/90 drop-shadow-md"
            >
              Editeur de cocktails prêts à boire
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

async function ProductGrid() {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Aucun produit disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={mapProductRowToCardData(product)}
        />
      ))}
    </div>
  );
}

export default function BoutiquePage() {
  return (
    <>
      <AgeVerificationWrapper />

      <div className="flex flex-col">
        {/* Hero Section */}
        <Suspense fallback={
          <section className="relative w-full h-[40vh] bg-gray-200 animate-pulse" />
        }>
          <HeroSection />
        </Suspense>

        {/* Products Section */}
        <div className="container px-4 py-8 md:py-12">
          <Suspense fallback={<ProductGridSkeleton count={6} />}>
            <ProductGrid />
          </Suspense>

          <div className="mt-16 bg-muted/40 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-serif mb-4">Comment servir nos cocktails</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Chaque cocktail L'invisible est conçu pour être simple à préparer.
              Il suffit d'ajouter les accompagnements suggérés (tonic, cola, nectar...)
              et des glaçons pour obtenir un cocktail parfait.
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div>
                <div className="text-3xl mb-2">1</div>
                <p className="text-sm text-muted-foreground">
                  Versez la quantité recommandée de premix
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">2</div>
                <p className="text-sm text-muted-foreground">
                  Ajoutez l'accompagnement suggéré
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">3</div>
                <p className="text-sm text-muted-foreground">
                  Complétez avec des glaçons et dégustez
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
