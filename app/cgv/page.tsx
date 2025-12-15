import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CGVPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Conditions Générales de Vente</h1>
        <p className="text-muted-foreground">
          Dernière mise à jour : Janvier 2025
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Préambule - Vérification d'âge</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p className="font-semibold">
              Vente interdite aux mineurs
            </p>
            <p>
              Conformément aux articles L3342-1 et L3353-3 du Code de la santé publique, 
              la vente de boissons alcoolisées à des mineurs de moins de 18 ans est strictement interdite.
            </p>
            <p>
              En passant commande sur le site www.cocktails-linvisible.fr, le Client certifie avoir 18 ans révolus 
              à la date de la commande. Une vérification de l'âge sera effectuée lors de la livraison 
              (présentation obligatoire d'une pièce d'identité).
            </p>
            <p className="text-sm italic">
              L'abus d'alcool est dangereux pour la santé. À consommer avec modération.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Article 1 - Objet et acceptation</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Les présentes Conditions Générales de Vente (CGV) s'appliquent à toutes les commandes 
              passées sur le site www.cocktails-linvisible.fr par toute personne physique majeure ou personne 
              morale (ci-après "le Client").
            </p>
            <p>
              L'invisible se réserve le droit de modifier ses CGV à tout moment. Les CGV applicables 
              sont celles en vigueur à la date de la commande.
            </p>
            <p>
              La validation de la commande implique l'acceptation sans réserve des présentes CGV.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Article 2 - Produits et prix</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Les produits proposés sont des cocktails prêts à boire, conditionnés et présentés 
              conformément à la réglementation en vigueur.
            </p>
            <p>
              Les prix sont indiqués en euros, toutes taxes comprises (TTC). Ils incluent la TVA 
              applicable au jour de la commande. L'invisible se réserve le droit de modifier ses 
              prix à tout moment, étant entendu que le prix figurant sur le site le jour de la 
              commande sera le seul applicable au Client.
            </p>
            <p>
              Les frais de livraison sont calculés automatiquement selon le poids total de la commande 
              et le pays de destination. Les tarifs débutent à :
            </p>
            <ul className="list-disc ml-6">
              <li>France - Point Relais : à partir de 3,89€</li>
              <li>France - Livraison à domicile : à partir de 4,99€</li>
              <li>Europe - Point Relais : à partir de 5,90€</li>
              <li>Europe - Livraison à domicile : à partir de 8,90€</li>
            </ul>
            <p>
              Le montant exact des frais de livraison est indiqué avant la validation finale de la commande.
              Pour les commandes dépassant 30kg, plusieurs colis peuvent être nécessaires, les frais 
              étant alors calculés en conséquence.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Article 3 - Commande</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Le Client peut passer commande sur le site www.cocktails-linvisible.fr. La commande ne peut 
              être enregistrée que si le Client s'est clairement identifié et a accepté les CGV.
            </p>
            <p>
              L'invisible se réserve le droit de refuser toute commande pour des motifs légitimes, 
              notamment en cas de :
            </p>
            <ul className="list-disc ml-6">
              <li>Problème d'approvisionnement</li>
              <li>Problème concernant la commande reçue</li>
              <li>Litige antérieur avec le Client</li>
            </ul>
            <p>
              Une confirmation de commande est envoyée par email au Client après validation du paiement.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Article 4 - Paiement</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Le paiement s'effectue en ligne exclusivement en euros (EUR) par carte bancaire 
              (Visa, Mastercard, American Express) via notre plateforme de paiement sécurisée Stripe. 
              Les données bancaires sont directement transmises à notre prestataire de paiement et 
              ne transitent pas par nos serveurs.
            </p>
            <p>
              Le débit de la carte est effectué au moment de la validation de la commande. En cas de 
              paiement refusé, la commande est automatiquement annulée et le Client en est informé par email.
            </p>
            <p>
              Les données de paiement sont cryptées selon les normes PCI-DSS. L'invisible ne conserve 
              aucune donnée bancaire du Client.
            </p>
            <p>
              En cas de retard de paiement au-delà de 30 jours après la date de facture, des pénalités 
              de retard seront appliquées au taux de trois fois le taux d'intérêt légal, ainsi qu'une 
              indemnité forfaitaire de 40€ pour frais de recouvrement.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Article 5 - Livraison</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Les livraisons sont effectuées en France et dans plusieurs pays européens : 
              Belgique, Espagne, Luxembourg, Pays-Bas, Allemagne, Italie et Portugal, via notre 
              partenaire Mondial Relay.
            </p>
            <p>
              Deux modes de livraison sont disponibles selon le pays :
            </p>
            <ul className="list-disc ml-6">
              <li><strong>Point Relais</strong> : Disponible en France, Belgique, Espagne, Luxembourg et Pays-Bas</li>
              <li><strong>Livraison à domicile</strong> : Disponible dans tous les pays livrés</li>
            </ul>
            <p>
              Les délais de livraison sont les suivants :
            </p>
            <ul className="list-disc ml-6">
              <li>France : 3 à 5 jours ouvrés</li>
              <li>Belgique, Espagne, Luxembourg, Pays-Bas : 3 à 4 jours ouvrés</li>
              <li>Allemagne, Italie, Portugal : 3 à 6 jours ouvrés</li>
            </ul>
            <p>
              Ces délais sont donnés à titre indicatif et s'entendent à compter de la validation du paiement.
            </p>
            <p>
              L'âge du destinataire sera vérifié lors de la livraison (pièce d'identité obligatoire). 
              La commande ne pourra être remise qu'à une personne majeure.
            </p>
            <p>
              En cas de retard de livraison, le Client doit le signaler à L'invisible qui fera le 
              nécessaire auprès du transporteur. En cas de perte ou d'avarie, une enquête sera 
              menée auprès du transporteur.
            </p>
            <p>
              Le Client doit vérifier l'état des produits à la réception. En cas de colis endommagé, 
              le Client doit impérativement faire des réserves détaillées auprès du transporteur et 
              nous en informer dans les 48 heures suivant la livraison par email à contact@linvisible.fr, 
              photos à l'appui.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Article 6 - Droit de rétractation</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation 
              ne s'applique pas aux boissons alcoolisées dont la livraison est différée au-delà de 
              trente jours et dont la valeur convenue à la conclusion du contrat dépend de 
              fluctuations sur le marché échappant au contrôle du professionnel.
            </p>
            <p>
              Toutefois, L'invisible accepte les retours dans un délai de 14 jours suivant la 
              livraison, sous réserve que :
            </p>
            <ul className="list-disc ml-6">
              <li>Les produits soient dans leur emballage d'origine, non ouverts</li>
              <li>Les produits n'aient subi aucune altération</li>
              <li>Le Client prenne en charge les frais de retour</li>
            </ul>
            <p>
              Le remboursement sera effectué dans un délai de 14 jours suivant la réception des 
              produits retournés en parfait état.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Article 7 - Garanties et responsabilité</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Tous nos produits bénéficient de la garantie légale de conformité (articles L217-4 et 
              suivants du Code de la consommation) et de la garantie contre les vices cachés (articles 
              1641 et suivants du Code civil).
            </p>
            <p>
              La garantie légale de conformité s'applique pendant 2 ans à compter de la livraison. 
              Le Client dispose de 2 ans pour agir et peut choisir entre la réparation ou le 
              remplacement du produit.
            </p>
            <p>
              Toute réclamation doit être effectuée dans un délai de 30 jours suivant la livraison 
              par email à contact@linvisible.fr. Les frais de retour sont remboursés sur présentation 
              de justificatifs en cas de non-conformité avérée.
            </p>
            <p>
              L'invisible ne saurait être tenu responsable de l'inexécution du contrat en cas de 
              force majeure, de perturbation ou grève totale ou partielle notamment des services 
              postaux et moyens de transport et/ou communications.
            </p>
            <p>
              L'invisible rappelle que la consommation d'alcool est interdite aux mineurs et 
              déconseillée aux femmes enceintes. L'abus d'alcool est dangereux pour la santé, 
              à consommer avec modération.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Article 8 - Protection des données personnelles</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Les données personnelles collectées lors de la commande sont nécessaires au traitement 
              de celle-ci et sont utilisées conformément à notre politique de confidentialité.
            </p>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD), le Client 
              dispose d'un droit d'accès, de rectification, de suppression et de portabilité de 
              ses données personnelles.
            </p>
            <p>
              Pour exercer ces droits, le Client peut nous contacter à : contact@linvisible.fr
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Article 9 - Propriété intellectuelle</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              L'ensemble du contenu du site www.cocktails-linvisible.fr (textes, images, logos, etc.) est 
              la propriété exclusive de L'invisible ou de ses partenaires. Toute reproduction, 
              même partielle, est strictement interdite sans autorisation préalable.
            </p>
            <p>
              La marque L'invisible ainsi que les noms des cocktails sont des marques déposées.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Article 10 - Archivage et preuve</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              L'invisible archivera les bons de commande et les factures sur un support fiable et 
              durable constituant une copie fidèle conformément aux dispositions de l'article 1348 
              du Code civil.
            </p>
            <p>
              Les registres informatisés de L'invisible seront considérés comme preuve des 
              communications, commandes, paiements et transactions intervenues entre les parties.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Article 11 - Clause de réserve de propriété</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              L'invisible se réserve la propriété des produits vendus jusqu'au paiement intégral 
              du prix par le Client.
            </p>
            <p>
              En cas de défaut de paiement, L'invisible pourra revendiquer les produits vendus. 
              La réserve de propriété ne fait pas obstacle au transfert des risques au Client 
              dès la livraison des produits.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Article 12 - Loi applicable et juridiction</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <p>
              Les présentes CGV sont régies par le droit français. En cas de litige, une solution 
              amiable sera recherchée avant toute action judiciaire.
            </p>
            <p>
              À défaut d'accord amiable, tout litige relatif à l'interprétation ou à l'exécution 
              des présentes CGV sera de la compétence exclusive des tribunaux de Bordeaux.
            </p>
            <p>
              Le Client peut également recourir à une procédure de médiation ou à tout autre mode 
              alternatif de règlement des litiges.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">L'invisible</p>
            <p>Éditeur de cocktails prêts à boire</p>
            <p>Email : contact@linvisible.fr</p>
            <p>Adresse : 15 rue Claude Taffanel - 33800 Bordeaux - France</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}