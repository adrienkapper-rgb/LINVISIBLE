"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/store";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { calculateTotalWeight, getShippingInfo } from "@/lib/shipping/mondial-relay-pricing";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCart();
  
  // Calcul dynamique du poids et du tarif de livraison (France par défaut)
  const totalWeight = calculateTotalWeight(items);
  const shippingInfo = getShippingInfo(totalWeight, 'FR', true);
  const shippingCost = items.length > 0 ? shippingInfo.cost : 0;
  
  const subtotal = getTotalPrice();
  const total = subtotal + shippingCost;

  if (items.length === 0) {
    return (
      <div className="container px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
          <h1 className="text-3xl font-serif mb-4">Votre panier est vide</h1>
          <p className="text-muted-foreground mb-8">
            Découvrez notre sélection de cocktails artisanaux
          </p>
          <Link href="/boutique">
            <Button size="lg" className="gap-2">
              Continuer mes achats <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-serif mb-8">Mon panier</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.product.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-serif text-lg">{item.product.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {item.product.volume} - {item.product.alcohol}% vol.
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-12 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">
                          {(item.product.price * item.quantity).toFixed(2)}€
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.product.price}€ / unité
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Livraison estimée (France)
                  </span>
                  <span className="text-muted-foreground">{shippingCost.toFixed(2)}€</span>
                </div>
                {items.length > 0 && shippingInfo.packageCount > 1 && (
                  <div className="text-sm text-muted-foreground">
                    Frais détaillés : {shippingInfo.packages.map((pkg, index) => 
                      `${(pkg.weight / 1000).toFixed(1)}kg (${pkg.cost.toFixed(2)}€)`
                    ).join(' + ')}
                  </div>
                )}
                {items.length > 0 && (
                  <div className="text-xs text-muted-foreground italic">
                    Les frais définitifs seront calculés selon votre destination
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{total.toFixed(2)}€</span>
              </div>
              
              <div className="space-y-2">
                <Link href="/checkout" className="block">
                  <Button className="w-full" size="lg">
                    Commander
                  </Button>
                </Link>
                <Link href="/boutique" className="block">
                  <Button variant="outline" className="w-full">
                    Continuer mes achats
                  </Button>
                </Link>
              </div>
              
              <div className="text-sm text-muted-foreground text-center">
                <p>Paiement sécurisé par Stripe</p>
                <p className="mt-2">Livraison sous 3-5 jours ouvrés</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}