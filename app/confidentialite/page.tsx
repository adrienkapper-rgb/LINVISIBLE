import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Politique de Confidentialité</h1>
        <p className="text-muted-foreground">
          Cette politique de confidentialité décrit comment L'invisible collecte, utilise et 
          protège vos données personnelles conformément au Règlement Général sur la Protection 
          des Données (RGPD) et à la loi Informatique et Libertés.
        </p>
        <p className="text-muted-foreground mt-2">
          Dernière mise à jour : Janvier 2025
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Responsable du traitement</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              <strong>L'invisible</strong> - Entreprise Individuelle
            </p>
            <p>
              <strong>Responsable :</strong> Adrien Kapper
            </p>
            <p>
              <strong>Adresse :</strong> 15 rue Claude Taffanel - 33800 Bordeaux - France
            </p>
            <p>
              <strong>Email :</strong> contact@linvisible.fr
            </p>
            <p>
              <strong>SIRET :</strong> 43872271200033
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Données personnelles collectées</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Nous collectons les données personnelles suivantes :
            </p>
            
            <h4 className="font-semibold mt-4">Données d'identification</h4>
            <ul className="list-disc ml-6">
              <li>Nom et prénom</li>
              <li>Adresse email</li>
              <li>Numéro de téléphone</li>
            </ul>

            <h4 className="font-semibold mt-4">Données de livraison</h4>
            <ul className="list-disc ml-6">
              <li>Adresse postale complète</li>
              <li>Informations de point relais (si applicable)</li>
            </ul>

            <h4 className="font-semibold mt-4">Données de commande</h4>
            <ul className="list-disc ml-6">
              <li>Historique des commandes</li>
              <li>Produits achetés</li>
              <li>Montants des transactions</li>
              <li>Préférences de livraison</li>
            </ul>

            <h4 className="font-semibold mt-4">Données techniques</h4>
            <ul className="list-disc ml-6">
              <li>Adresse IP</li>
              <li>Données de navigation (cookies)</li>
              <li>Type de navigateur et appareil</li>
              <li>Logs de connexion</li>
            </ul>

            <h4 className="font-semibold mt-4">Données de paiement</h4>
            <p>
              Les données bancaires sont collectées et traitées directement par notre prestataire 
              de paiement Stripe. Nous ne stockons aucune donnée bancaire sur nos serveurs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Finalités du traitement</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Vos données personnelles sont traitées pour les finalités suivantes :
            </p>

            <h4 className="font-semibold mt-4">Gestion des commandes (base légale : exécution du contrat)</h4>
            <ul className="list-disc ml-6">
              <li>Traitement et validation des commandes</li>
              <li>Préparation et expédition des produits</li>
              <li>Suivi de livraison</li>
              <li>Gestion des retours et remboursements</li>
            </ul>

            <h4 className="font-semibold mt-4">Relation client (base légale : exécution du contrat)</h4>
            <ul className="list-disc ml-6">
              <li>Réponse à vos demandes</li>
              <li>Service après-vente</li>
              <li>Gestion des réclamations</li>
            </ul>

            <h4 className="font-semibold mt-4">Marketing (base légale : consentement)</h4>
            <ul className="list-disc ml-6">
              <li>Envoi de newsletters</li>
              <li>Offres promotionnelles personnalisées</li>
              <li>Informations sur nos nouveaux produits</li>
            </ul>

            <h4 className="font-semibold mt-4">Obligations légales</h4>
            <ul className="list-disc ml-6">
              <li>Respect des obligations comptables et fiscales</li>
              <li>Vérification de l'âge (vente d'alcool)</li>
              <li>Archivage des factures</li>
            </ul>

            <h4 className="font-semibold mt-4">Sécurité et prévention des fraudes</h4>
            <ul className="list-disc ml-6">
              <li>Lutte contre la fraude</li>
              <li>Sécurisation des paiements</li>
              <li>Protection de notre site web</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Base légale du traitement</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Le traitement de vos données personnelles est fondé sur :
            </p>
            <ul className="list-disc ml-6">
              <li>
                <strong>L'exécution d'un contrat :</strong> pour le traitement de vos commandes, 
                la livraison et la relation client
              </li>
              <li>
                <strong>Votre consentement :</strong> pour l'envoi de communications marketing 
                et l'utilisation de certains cookies
              </li>
              <li>
                <strong>Le respect d'obligations légales :</strong> pour la comptabilité, 
                la fiscalité et la vérification d'âge
              </li>
              <li>
                <strong>Notre intérêt légitime :</strong> pour la sécurité du site et la 
                prévention des fraudes
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Destinataires des données</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Vos données personnelles peuvent être partagées avec :
            </p>

            <h4 className="font-semibold mt-4">Prestataires techniques</h4>
            <ul className="list-disc ml-6">
              <li><strong>Supabase :</strong> hébergement de la base de données (UE)</li>
              <li><strong>Vercel :</strong> hébergement du site web (États-Unis)</li>
              <li><strong>Stripe :</strong> traitement des paiements (UE/États-Unis)</li>
            </ul>

            <h4 className="font-semibold mt-4">Partenaires logistiques</h4>
            <ul className="list-disc ml-6">
              <li><strong>Mondial Relay :</strong> livraison des commandes (UE)</li>
            </ul>

            <h4 className="font-semibold mt-4">Autorités compétentes</h4>
            <p>
              En cas d'obligation légale ou de demande judiciaire, nous pouvons être amenés 
              à communiquer vos données aux autorités compétentes.
            </p>

            <h4 className="font-semibold mt-4">Transferts hors UE</h4>
            <p>
              Certains de nos prestataires peuvent être situés hors de l'Union Européenne. 
              Dans ce cas, les transferts sont sécurisés par des clauses contractuelles types 
              approuvées par la Commission Européenne ou par des certifications de conformité.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Durée de conservation</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Nous conservons vos données personnelles pour les durées suivantes :
            </p>

            <h4 className="font-semibold mt-4">Données de compte client</h4>
            <ul className="list-disc ml-6">
              <li>Compte actif : pendant toute la durée d'utilisation</li>
              <li>Compte inactif : 3 ans après la dernière connexion</li>
            </ul>

            <h4 className="font-semibold mt-4">Données de commande</h4>
            <ul className="list-disc ml-6">
              <li>Données commerciales : 5 ans après la commande</li>
              <li>Factures : 10 ans (obligation légale)</li>
            </ul>

            <h4 className="font-semibold mt-4">Données marketing</h4>
            <ul className="list-disc ml-6">
              <li>Newsletter : jusqu'à votre désinscription</li>
              <li>Prospection : 3 ans après le dernier contact</li>
            </ul>

            <h4 className="font-semibold mt-4">Données techniques</h4>
            <ul className="list-disc ml-6">
              <li>Logs de connexion : 12 mois maximum</li>
              <li>Cookies : selon leur durée de validité (voir section cookies)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Vos droits</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Conformément au RGPD, vous disposez des droits suivants :
            </p>

            <h4 className="font-semibold mt-4">Droit d'accès</h4>
            <p>
              Vous pouvez demander une copie de toutes les données personnelles que nous 
              détenons à votre sujet.
            </p>

            <h4 className="font-semibold mt-4">Droit de rectification</h4>
            <p>
              Vous pouvez demander la correction de données inexactes ou incomplètes.
            </p>

            <h4 className="font-semibold mt-4">Droit à l'effacement</h4>
            <p>
              Vous pouvez demander la suppression de vos données dans certaines conditions 
              (retrait du consentement, données non nécessaires, etc.).
            </p>

            <h4 className="font-semibold mt-4">Droit à la limitation</h4>
            <p>
              Vous pouvez demander la limitation du traitement de vos données dans certains cas.
            </p>

            <h4 className="font-semibold mt-4">Droit à la portabilité</h4>
            <p>
              Vous pouvez récupérer vos données dans un format structuré et les transférer 
              à un autre responsable de traitement.
            </p>

            <h4 className="font-semibold mt-4">Droit d'opposition</h4>
            <p>
              Vous pouvez vous opposer au traitement de vos données, notamment pour le marketing.
            </p>

            <h4 className="font-semibold mt-4">Comment exercer vos droits</h4>
            <p>
              Pour exercer ces droits, contactez-nous à : <strong>contact@linvisible.fr</strong>
            </p>
            <p>
              Nous vous répondrons dans un délai d'un mois. Une pièce d'identité pourra être 
              demandée pour vérifier votre identité.
            </p>

            <h4 className="font-semibold mt-4">Droit de réclamation</h4>
            <p>
              Vous pouvez également introduire une réclamation auprès de la CNIL : 
              <a href="https://www.cnil.fr" className="text-blue-600 hover:underline">www.cnil.fr</a>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. Sécurité des données</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées 
              pour protéger vos données personnelles :
            </p>

            <h4 className="font-semibold mt-4">Mesures techniques</h4>
            <ul className="list-disc ml-6">
              <li>Chiffrement des données en transit (HTTPS/SSL)</li>
              <li>Chiffrement des données sensibles en base</li>
              <li>Accès sécurisé aux systèmes (authentification forte)</li>
              <li>Sauvegardes régulières et sécurisées</li>
              <li>Surveillance et détection d'intrusions</li>
            </ul>

            <h4 className="font-semibold mt-4">Mesures organisationnelles</h4>
            <ul className="list-disc ml-6">
              <li>Accès aux données limité aux personnes autorisées</li>
              <li>Sensibilisation à la sécurité des données</li>
              <li>Procédures de gestion des incidents</li>
              <li>Audits de sécurité réguliers</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>9. Cookies et traceurs</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Notre site utilise des cookies pour améliorer votre expérience et analyser 
              l'utilisation du site.
            </p>

            <h4 className="font-semibold mt-4">Types de cookies</h4>
            
            <div className="mt-4">
              <h5 className="font-medium">Cookies strictement nécessaires</h5>
              <p className="text-sm">
                Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés :
              </p>
              <ul className="list-disc ml-6 text-sm">
                <li>Gestion de votre panier d'achat</li>
                <li>Maintien de votre session de connexion</li>
                <li>Sécurisation des formulaires</li>
              </ul>
            </div>

            <div className="mt-4">
              <h5 className="font-medium">Cookies analytiques</h5>
              <p className="text-sm">
                Ces cookies nous aident à comprendre comment vous utilisez notre site :
              </p>
              <ul className="list-disc ml-6 text-sm">
                <li>Pages visitées et durée de visite</li>
                <li>Parcours de navigation</li>
                <li>Source du trafic</li>
              </ul>
            </div>

            <div className="mt-4">
              <h5 className="font-medium">Cookies de paiement</h5>
              <p className="text-sm">
                Stripe utilise des cookies pour sécuriser les transactions et prévenir la fraude.
              </p>
            </div>

            <h4 className="font-semibold mt-4">Gestion des cookies</h4>
            <p>
              Vous pouvez gérer vos préférences de cookies :
            </p>
            <ul className="list-disc ml-6">
              <li>Via les paramètres de votre navigateur</li>
              <li>En nous contactant à : contact@linvisible.fr</li>
            </ul>

            <h4 className="font-semibold mt-4">Durée des cookies</h4>
            <ul className="list-disc ml-6">
              <li>Cookies de session : supprimés à la fermeture du navigateur</li>
              <li>Cookies persistants : entre 1 mois et 2 ans selon leur fonction</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>10. Modifications de cette politique</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Nous pouvons modifier cette politique de confidentialité à tout moment pour 
              refléter les évolutions de nos pratiques ou de la législation.
            </p>
            <p>
              En cas de modification substantielle, nous vous en informerons par email ou 
              via une notification sur notre site.
            </p>
            <p>
              La version en vigueur est toujours disponible sur cette page avec sa date de 
              dernière mise à jour.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>11. Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Pour toute question concernant cette politique de confidentialité ou le 
              traitement de vos données personnelles :
            </p>
            <div className="mt-4">
              <p><strong>L'invisible</strong></p>
              <p>Adrien Kapper</p>
              <p>Email : <a href="mailto:contact@linvisible.fr" className="text-blue-600 hover:underline">contact@linvisible.fr</a></p>
              <p>Adresse : 15 rue Claude Taffanel - 33800 Bordeaux - France</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}