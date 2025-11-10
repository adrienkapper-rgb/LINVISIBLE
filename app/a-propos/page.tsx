import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos - Cocktails L'invisible",
  description: "Découvrez L'invisible, maison bordelaise spécialisée dans les cocktails artisanaux prêts à boire. De l'artisanat local au service des professionnels et à l'édition de cocktails signatures.",
  openGraph: {
    title: "À propos - Cocktails L'invisible",
    description: "Découvrez L'invisible, maison bordelaise spécialisée dans les cocktails artisanaux prêts à boire.",
    type: "website",
    url: "https://www.cocktails-linvisible.fr/a-propos",
    siteName: "L'invisible",
  },
  alternates: {
    canonical: "https://www.cocktails-linvisible.fr/a-propos",
  },
};

export default function AProposPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background to-muted/40 py-16 md:py-24">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif mb-6">À propos de L'invisible</h1>
            <p className="text-xl text-muted-foreground">
              Découvrez notre histoire, notre savoir-faire et nos engagements
            </p>
          </div>
        </div>
      </section>

      {/* Section 1: Artisan du Cocktail - Aligné à gauche */}
      <section className="py-12 md:py-16">
        <div className="container px-4">
          <div className="grid md:grid-cols-3 gap-8 items-center">
            <div className="md:col-span-2 text-left">
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Artisan du cocktail
              </h2>
              <p className="text-lg text-muted-foreground text-justify">
                La maison "L'invisible" est située au cœur de Bordeaux et à proximité de la région de Cognac. Elle vous offre une sélection de cocktails de haute qualité et prêts à déguster chez soi.
              </p>
            </div>
            <div className="md:col-span-1 flex justify-end">
              {/* Pas de bouton pour cette section */}
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Au Service des Professionnels - Aligné à droite */}
      <section className="py-12 md:py-16 bg-muted/20">
        <div className="container px-4">
          <div className="text-right max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif mb-6">
              Au service des professionnels
            </h2>
            <p className="text-lg text-muted-foreground mb-4 text-justify">
              Notre carte de cocktails classiques, préparés avec un soin méticuleux et des ingrédients de qualité, est pensée pour offrir une expérience unique tout en vous faisant gagner un temps précieux.
            </p>
            <p className="text-lg text-muted-foreground text-justify">
              Mais la véritable valeur ajoutée de « L'invisible » réside dans notre capacité à créer des solutions sur mesure. Flexibles et à l'écoute, nous façonnons des cocktails à la demande, adaptés à votre clientèle et à vos désirs.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Éditeur de Cocktails - Aligné à gauche */}
      <section className="py-12 md:py-16">
        <div className="container px-4">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 items-end">
            <div className="md:col-span-2 text-left">
              <h2 className="text-3xl md:text-4xl font-serif mb-6">
                Éditeur de Cocktails
              </h2>
              <p className="text-lg text-muted-foreground mb-4 text-justify">
                Notre savoir-faire s'étend également à la création et à la diffusion de
                cocktails signatures, conçus pour mettre en lumière des mixologues d'exception.
              </p>
              <p className="text-lg text-muted-foreground text-justify">
                Ce service exclusif s'adresse aux créateurs indépendants souhaitant partager
                leurs œuvres avec le monde, ainsi qu'aux organisateurs de concours désireux
                d'immortaliser des créations gagnantes.
              </p>
            </div>
            <div className="md:col-span-1 flex justify-end">
              <Link href="/contact">
                <Button size="lg" className="gap-2">
                  <span className="md:hidden lg:hidden xl:inline">Contact</span>
                  <span className="hidden md:inline lg:hidden">Contact</span>
                  <span className="hidden lg:inline xl:hidden">Nous contacter</span>
                  <span className="hidden xl:inline">Nous contacter pour un projet</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
