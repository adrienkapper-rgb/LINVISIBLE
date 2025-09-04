import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MentionsLegalesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Mentions Légales</h1>
        <p className="text-muted-foreground">
          Conformément aux dispositions de la loi n° 2004-575 du 21 juin 2004 pour la confiance 
          dans l'économie numérique, il est précisé aux utilisateurs du site www.cocktails-linvisible.fr 
          l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Éditeur du site</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="font-semibold">L'invisible</p>
            <p>Éditeur de cocktails prêts à boire</p>
            <p>
              <strong>Siège social :</strong> 15 rue Claude Taffanel - 33800 Bordeaux - France
            </p>
            <p>
              <strong>Email :</strong> contact@linvisible.fr
            </p>
            <p>
              <strong>Forme juridique :</strong> Entreprise Individuelle (EI)
            </p>
            <p>
              <strong>N° SIRET :</strong> 43872271200033
            </p>
            <p>
              <strong>N° TVA intracommunautaire :</strong> FR77438722712
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Directeur de la publication</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              <strong>Nom :</strong> Adrien Kapper
            </p>
            <p>
              <strong>Qualité :</strong> Directeur
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hébergement du site</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="font-semibold">Vercel Inc.</p>
            <p>440 N Barranca Ave #4133</p>
            <p>Covina, CA 91723</p>
            <p>United States</p>
            <p>Email : privacy@vercel.com</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Conception et développement</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="font-semibold">Service développement - Cocktails L'invisible</p>
            <p>15 rue Claude Taffanel - 33800 Bordeaux - France</p>
            <p>Email : contact@linvisible.fr</p>
            
            <h4 className="font-semibold mt-4">Technologies utilisées</h4>
            <ul className="list-disc ml-6">
              <li>Next.js / TypeScript</li>
              <li>Tailwind CSS</li>
              <li>Supabase (base de données)</li>
              <li>Stripe (paiements sécurisés)</li>
              <li>Vercel (hébergement)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Propriété intellectuelle</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              L'ensemble de ce site relève de la législation française et internationale sur le droit 
              d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, 
              y compris pour les documents téléchargeables et les représentations iconographiques et 
              photographiques.
            </p>
            <p>
              La marque L'invisible, le logo et tous les signes distinctifs sont des marques déposées. 
              Toute reproduction totale ou partielle de ces marques ou de ces logos effectuée à partir 
              des éléments du site sans l'autorisation expresse de L'invisible est prohibée au sens 
              du Code de la propriété intellectuelle.
            </p>
            <p>
              Les textes, images, graphismes, structure, base de données et logiciels constituant le 
              site sont la propriété exclusive de L'invisible et sont protégés par le droit d'auteur.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Protection des données personnelles</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              <strong>Responsable du traitement :</strong> L'invisible
            </p>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi 
              Informatique et Libertés du 6 janvier 1978 modifiée, vous disposez de droits sur vos 
              données personnelles.
            </p>
            
            <h4 className="font-semibold mt-4">Données collectées</h4>
            <p>
              Les données personnelles collectées sur ce site sont les suivantes :
            </p>
            <ul className="list-disc ml-6">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
              <li>Adresse de livraison</li>
              <li>Données de paiement (traitées par Stripe, non stockées sur nos serveurs)</li>
            </ul>

            <h4 className="font-semibold mt-4">Finalités du traitement</h4>
            <ul className="list-disc ml-6">
              <li>Traitement et suivi des commandes</li>
              <li>Livraison des produits</li>
              <li>Gestion de la relation client</li>
              <li>Envoi d'informations commerciales (avec consentement)</li>
              <li>Respect des obligations légales</li>
            </ul>

            <h4 className="font-semibold mt-4">Base légale</h4>
            <p>
              Le traitement de vos données est fondé sur :
            </p>
            <ul className="list-disc ml-6">
              <li>L'exécution du contrat de vente</li>
              <li>Le consentement pour l'envoi de communications commerciales</li>
              <li>Les obligations légales (comptabilité, fiscalité)</li>
            </ul>

            <h4 className="font-semibold mt-4">Durée de conservation</h4>
            <p>
              Les données sont conservées pendant la durée nécessaire à la gestion de la relation 
              commerciale et conformément aux obligations légales de conservation.
            </p>

            <h4 className="font-semibold mt-4">Vos droits</h4>
            <p>
              Vous disposez des droits suivants :
            </p>
            <ul className="list-disc ml-6">
              <li>Droit d'accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l'effacement</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité</li>
              <li>Droit d'opposition</li>
            </ul>
            <p>
              Pour exercer ces droits, contactez-nous à : contact@linvisible.fr
            </p>
            <p>
              Vous pouvez également introduire une réclamation auprès de la CNIL : www.cnil.fr
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookies</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Le site www.cocktails-linvisible.fr utilise des cookies pour améliorer l'expérience utilisateur 
              et analyser le trafic.
            </p>
            
            <h4 className="font-semibold mt-4">Types de cookies utilisés</h4>
            <ul className="list-disc ml-6">
              <li>
                <strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site 
                (panier, authentification)
              </li>
              <li>
                <strong>Cookies analytiques :</strong> Pour comprendre l'utilisation du site 
                (avec consentement)
              </li>
              <li>
                <strong>Cookies de paiement :</strong> Stripe utilise des cookies pour sécuriser 
                les transactions
              </li>
            </ul>

            <h4 className="font-semibold mt-4">Gestion des cookies</h4>
            <p>
              Vous pouvez gérer vos préférences de cookies à tout moment via les paramètres de 
              votre navigateur ou en nous contactant.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vente de boissons alcoolisées</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="font-semibold">
              VENTE INTERDITE AUX MINEURS
            </p>
            <p>
              La vente de boissons alcoolisées à des mineurs de moins de 18 ans est interdite 
              (Article L3342-1 du Code de la santé publique).
            </p>
            <p>
              En passant commande sur ce site, vous certifiez avoir 18 ans révolus. Une pièce 
              d'identité sera demandée lors de la livraison.
            </p>
            <p>
              <strong>Licence de vente à distance :</strong> [À compléter avec le numéro de licence]
            </p>
            <p className="italic mt-4">
              L'ABUS D'ALCOOL EST DANGEREUX POUR LA SANTÉ. À CONSOMMER AVEC MODÉRATION.
            </p>
            <p className="italic">
              La consommation de boissons alcoolisées pendant la grossesse, même en faible quantité, 
              peut avoir des conséquences graves sur la santé de l'enfant.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsabilité</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              L'invisible s'efforce d'assurer l'exactitude et la mise à jour des informations 
              diffusées sur ce site. Toutefois, L'invisible ne peut garantir l'exactitude, la 
              précision ou l'exhaustivité des informations mises à disposition sur ce site.
            </p>
            <p>
              En conséquence, L'invisible décline toute responsabilité pour toute imprécision, 
              inexactitude ou omission portant sur des informations disponibles sur le site.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Liens hypertextes</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Le site www.cocktails-linvisible.fr peut contenir des liens hypertextes vers d'autres sites. 
              L'invisible n'exerce aucun contrôle sur ces sites et décline toute responsabilité 
              quant à leur contenu ou leur fonctionnement.
            </p>
            <p>
              La création de liens vers le site www.cocktails-linvisible.fr nécessite l'autorisation 
              préalable écrite de L'invisible.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Droit applicable et juridiction</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Les présentes mentions légales sont régies par le droit français. En cas de litige, 
              les tribunaux de Bordeaux seront seuls compétents.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
            </p>
            <p className="mt-2">
              <strong>Email :</strong> contact@linvisible.fr
            </p>
            <p>
              <strong>Adresse :</strong> L'invisible - 15 rue Claude Taffanel - 33800 Bordeaux - France
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}