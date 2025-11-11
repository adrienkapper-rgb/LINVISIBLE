import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { getAboutPageContent } from "@/lib/api/interface";

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

export default async function AProposPage() {
  // Load page content from database (default to French)
  const content = await getAboutPageContent('fr')

  // Fallback content if database fails
  const fallbackContent = {
    hero: {
      title: "À propos de L'invisible",
      subtitle: "Découvrez notre histoire, notre savoir-faire et nos engagements"
    },
    artisan: {
      title: "Artisan du cocktail",
      paragraph_1: "La maison \"L'invisible\" est située au cœur de Bordeaux et à proximité de la région de Cognac. Elle vous offre une sélection de cocktails de haute qualité et prêts à déguster chez soi."
    },
    professionals: {
      title: "Au service des professionnels",
      paragraph_1: "Notre carte de cocktails classiques, préparés avec un soin méticuleux et des ingrédients de qualité, est pensée pour offrir une expérience unique tout en vous faisant gagner un temps précieux.",
      paragraph_2: "Mais la véritable valeur ajoutée de « L'invisible » réside dans notre capacité à créer des solutions sur mesure. Flexibles et à l'écoute, nous façonnons des cocktails à la demande, adaptés à votre clientèle et à vos désirs."
    },
    editor: {
      title: "Éditeur de Cocktails",
      paragraph_1: "Notre savoir-faire s'étend également à la création et à la diffusion de cocktails signatures, conçus pour mettre en lumière des mixologues d'exception.",
      paragraph_2: "Ce service exclusif s'adresse aux créateurs indépendants souhaitant partager leurs œuvres avec le monde, ainsi qu'aux organisateurs de concours désireux d'immortaliser des créations gagnantes."
    }
  }

  const pageContent = content || fallbackContent

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background to-muted/40 py-16 md:py-24">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-serif mb-6">
              {pageContent.hero.title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {pageContent.hero.subtitle}
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
                {pageContent.artisan.title}
              </h2>
              <p className="text-lg text-muted-foreground text-justify">
                {pageContent.artisan.paragraph_1}
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
              {pageContent.professionals.title}
            </h2>
            <p className="text-lg text-muted-foreground mb-4 text-justify">
              {pageContent.professionals.paragraph_1}
            </p>
            <p className="text-lg text-muted-foreground text-justify">
              {pageContent.professionals.paragraph_2}
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
                {pageContent.editor.title}
              </h2>
              <p className="text-lg text-muted-foreground mb-4 text-justify">
                {pageContent.editor.paragraph_1}
              </p>
              <p className="text-lg text-muted-foreground text-justify">
                {pageContent.editor.paragraph_2}
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
