"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Sparkles, Award, Users } from "lucide-react";
import { getProducts, type Product } from "@/lib/products";
import { AgeVerificationDialog } from "@/components/AgeVerificationDialog";
import { useRouter } from "next/navigation";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  useEffect(() => {
    getProducts().then(products => {
      setFeaturedProducts(products.slice(0, 3));
    });
  }, []);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const ageVerified = localStorage.getItem("ageVerified");
    if (!ageVerified) {
      setShowAgeVerification(true);
    }
  }, []);

  const handleAgeConfirm = () => {
    localStorage.setItem("ageVerified", "true");
    setShowAgeVerification(false);
  };

  const handleAgeDeny = () => {
    window.location.href = "https://www.google.com";
  };

  return (
    <>
      <AgeVerificationDialog 
        isOpen={showAgeVerification}
        onConfirm={handleAgeConfirm}
        onDeny={handleAgeDeny}
      />
      
      <div className="flex flex-col">
        {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-background to-muted/40">
        <div className="container px-4 py-16 text-center">
          <h1 className="text-5xl md:text-7xl font-serif mb-4">L'invisible</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-2">
            Éditeur de cocktail
          </p>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Atelier artisanal dédié à l'art des cocktails, niché au cœur de Bordeaux
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/boutique">
              <Button size="lg" className="gap-2">
                Découvrir nos cocktails <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline">
                Notre histoire
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Concept Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Artisan du Cocktail
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                La maison « L'invisible », nichée au cœur de Bordeaux, est un atelier 
                artisanal dédié à l'art des cocktails. Nous avons à cœur d'accompagner 
                les professionnels dans la réalisation de boissons qui transcendent l'ordinaire.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Notre carte de cocktails classiques, préparés avec un soin méticuleux et 
                des ingrédients de qualité, est pensée pour offrir une expérience unique 
                tout en vous faisant gagner un temps précieux.
              </p>
              <p className="text-lg text-muted-foreground">
                Mais la véritable valeur ajoutée de « L'invisible » réside dans notre 
                capacité à créer des solutions sur mesure. Flexibles et à l'écoute, nous 
                façonnons des cocktails à la demande, adaptés à votre clientèle et à vos 
                désirs.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-muted/40">
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-8 w-8 mb-3 mx-auto" />
                  <h3 className="font-medium mb-2">Artisanal</h3>
                  <p className="text-sm text-muted-foreground">
                    Chaque création est une œuvre taillée à la main
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-muted/40">
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 mb-3 mx-auto" />
                  <h3 className="font-medium mb-2">Excellence</h3>
                  <p className="text-sm text-muted-foreground">
                    Ingrédients de qualité supérieure
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-muted/40">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 mb-3 mx-auto" />
                  <h3 className="font-medium mb-2">Sur mesure</h3>
                  <p className="text-sm text-muted-foreground">
                    Solutions adaptées à vos besoins
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-muted/40">
                <CardContent className="p-6 text-center">
                  <Sparkles className="h-8 w-8 mb-3 mx-auto" />
                  <h3 className="font-medium mb-2">Créativité</h3>
                  <p className="text-sm text-muted-foreground">
                    Cocktails signatures uniques
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-muted/40">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Nos cocktails en premix
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez notre sélection de cocktails classiques revisités, 
              prêts à être dégustés avec une simple touche personnelle
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative bg-gradient-to-b from-muted/20 to-muted/40">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain p-8"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-serif mb-2">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{product.price}€</span>
                    <Link href={`/produit/${product.slug}`}>
                      <Button variant="outline" size="sm">
                        Découvrir
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/boutique">
              <Button size="lg" className="gap-2">
                Voir tous nos cocktails <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Éditeur de Cocktails Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif mb-6">
              Éditeur de Cocktails
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              Notre savoir-faire s'étend également à la création et à la diffusion de 
              cocktails signatures, conçus pour mettre en lumière des mixologues d'exception.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              Ce service exclusif s'adresse aux créateurs indépendants souhaitant partager 
              leurs œuvres avec le monde, ainsi qu'aux organisateurs de concours désireux 
              d'immortaliser des créations gagnantes.
            </p>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Nous contacter pour un projet
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}
