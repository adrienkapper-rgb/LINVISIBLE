import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, Mail, ArrowRight, Loader2 } from "lucide-react";
import { getOrderByNumber, getOrderItems } from "@/lib/api/orders";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface ConfirmationPageProps {
  searchParams: Promise<{ order?: string }>;
}

// Composant de loading
function LoadingConfirmation() {
  return (
    <div className="container px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>
        <h1 className="text-3xl font-serif mb-2">Finalisation de votre commande...</h1>
        <p className="text-muted-foreground">
          Nous préparons votre confirmation, veuillez patienter quelques instants.
        </p>
      </div>
    </div>
  );
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const params = await searchParams;
  const orderNumber = params.order;
  
  if (!orderNumber) {
    notFound();
  }

  // Attendre la commande avec retry automatique
  const order = await getOrderByNumber(orderNumber, 8); // 8 tentatives = ~16 secondes max
  const orderItems = order ? await getOrderItems(order.id) : [];
  
  if (!order) {
    return (
      <div className="container px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
            <ArrowRight className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-serif mb-2">Commande en cours de traitement</h1>
          <p className="text-muted-foreground mb-6">
            Votre paiement a été accepté mais votre commande est encore en cours de traitement. 
            Vous recevrez un email de confirmation dans quelques minutes.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Numéro de commande : <span className="font-mono">{orderNumber}</span>
          </p>
          <Link href="/">
            <Button>Retour à l'accueil</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-serif mb-2">Commande confirmée !</h1>
          <p className="text-muted-foreground">
            Merci pour votre commande. Nous vous avons envoyé un email de confirmation.
          </p>
        </div>

        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Numéro de commande</p>
                <p className="font-mono text-lg">{order.order_number}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Informations client</p>
                <p className="font-medium">{order.first_name} {order.last_name}</p>
                <p className="text-sm text-muted-foreground">{order.email}</p>
                <p className="text-sm text-muted-foreground">{order.phone}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Articles commandés</p>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.product_name} x {item.quantity}</span>
                      <span>{item.total.toFixed(2)}€</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Total TTC</span>
                    <span>{order.total.toFixed(2)}€</span>
                  </div>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    {order.delivery_type === 'point-relais' ? (
                      <>
                        <p className="font-medium mb-1">Point Relais</p>
                        <p className="text-sm text-muted-foreground mb-1">
                          Lieu : {order.mondial_relay_point}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Disponible dans 3-4 jours ouvrés
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium mb-1">Livraison à domicile</p>
                        <div className="text-sm text-muted-foreground mb-1">
                          <p>{order.delivery_address}</p>
                          <p>{order.delivery_postal_code} {order.delivery_city}</p>
                          {order.delivery_country !== 'FR' && (
                            <p>{order.delivery_country}</p>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Livraison dans 3-5 jours ouvrés
                        </p>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Email de confirmation</p>
                    <p className="text-sm text-muted-foreground">
                      Envoyé à {order.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-muted/40 rounded-lg p-6 mb-8">
          <h2 className="font-semibold mb-3">Prochaines étapes</h2>
          {order.delivery_type === 'point-relais' ? (
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. Vous recevrez un email lorsque votre colis sera prêt</li>
              <li>2. Un SMS vous sera envoyé quand il arrivera au point relais</li>
              <li>3. Présentez votre pièce d'identité pour retirer votre commande</li>
              <li>4. Savourez vos cocktails L'invisible avec modération !</li>
            </ol>
          ) : (
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li>1. Vous recevrez un email lorsque votre colis sera expédié</li>
              <li>2. Un email de suivi vous permettra de suivre la livraison</li>
              <li>3. Veillez à être présent à l'adresse de livraison</li>
              <li>4. Savourez vos cocktails L'invisible avec modération !</li>
            </ol>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/boutique">
            <Button variant="outline" className="gap-2">
              Continuer mes achats
            </Button>
          </Link>
          <Link href="/">
            <Button className="gap-2">
              Retour à l'accueil <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}