import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Home, ShoppingBag, Mail } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page non trouvée - L'invisible Bordeaux",
  description: "La page que vous recherchez n'existe pas. Découvrez nos cocktails artisanaux ou contactez notre atelier bordelais.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-8xl font-serif mb-4 text-muted-foreground">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">Page non trouvée</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée. 
            Explorez nos <strong>cocktails artisanaux bordelais</strong> ou contactez-nous 
            pour vos <strong>projets sur mesure</strong>.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Home className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Accueil</h3>
              <p className="text-muted-foreground mb-4">
                Découvrez L'invisible, atelier cocktails à Bordeaux
              </p>
              <Link href="/">
                <Button className="w-full">
                  Retour à l'accueil
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Boutique</h3>
              <p className="text-muted-foreground mb-4">
                Cocktails classiques et signatures prêts à boire
              </p>
              <Link href="/">
                <Button className="w-full">
                  Voir nos cocktails
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">Contact</h3>
              <p className="text-muted-foreground mb-4">
                Projets sur mesure, événements, formations
              </p>
              <Link href="/contact">
                <Button className="w-full">
                  Nous contacter
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Local SEO Content */}
        <div className="bg-muted/40 rounded-lg p-8 text-left max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-4 text-center">
            L'invisible - Atelier Cocktails Bordeaux
          </h3>
          <div className="space-y-4 text-muted-foreground">
            <p>
              <strong>Vous cherchiez peut-être :</strong>
            </p>
            <ul className="space-y-2 ml-4">
              <li>• <Link href="/" className="hover:text-primary underline">Cocktails artisanaux Bordeaux</Link></li>
              <li>• <Link href="/contact" className="hover:text-primary underline">Cocktails pour restaurants Gironde</Link></li>
              <li>• <Link href="/contact" className="hover:text-primary underline">Événements privés Bordeaux métropole</Link></li>
              <li>• <Link href="/" className="hover:text-primary underline">Cocktails signatures Nouvelle-Aquitaine</Link></li>
            </ul>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-12">
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}