import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-8 md:py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-serif mb-3">L'invisible</h3>
            <p className="text-sm text-muted-foreground">
              Éditeur de cocktail artisanal
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Niché au cœur de Bordeaux
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  Accueil
                </Link>
              </li>
              <li>
                <Link href="/boutique" className="text-muted-foreground hover:text-primary">
                  Boutique
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">
                  À propos
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Informations légales</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/cgv" className="text-muted-foreground hover:text-primary">
                  Conditions générales de vente
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="text-muted-foreground hover:text-primary">
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link href="/confidentialite" className="text-muted-foreground hover:text-primary">
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-3">Avertissement</h4>
            <p className="text-sm text-muted-foreground">
              L'abus d'alcool est dangereux pour la santé.
              À consommer avec modération.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Vente interdite aux mineurs de moins de 18 ans.
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© 2024 L'invisible. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}