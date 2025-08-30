"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, ChevronLeft, Wine, Droplets, FlaskConical } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";

interface ProductDetailsProps {
  product: {
    id: string;
    slug: string;
    name: string;
    price: number;
    volume: string;
    alcohol: number;
    image: string;
    description: string | null;
    ingredients: string[];
    serving_instructions: string | null;
    serving_size: string | null;
    available: boolean;
    weight: number;
  };
  otherProducts: Array<{
    id: string;
    slug: string;
    name: string;
    price: number;
    volume: string;
    alcohol: number;
    image: string;
    description: string | null;
    ingredients: string[];
    serving_instructions: string | null;
    serving_size: string | null;
    available: boolean;
    weight: number;
  }>;
}

export default function ProductDetails({ product, otherProducts }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState("1");
  const addItem = useCart((state) => state.addItem);
  const { toast } = useToast();

  const handleAddToCart = () => {
    const qty = parseInt(quantity);
    addItem(product, qty);
    toast({
      title: "Ajouté au panier",
      description: `${qty} x ${product.name} ajouté${qty > 1 ? 's' : ''} à votre panier`,
    });
  };

  return (
    <div className="container px-4 py-8">
      <Link href="/boutique">
        <Button variant="ghost" className="mb-6 gap-2">
          <ChevronLeft className="h-4 w-4" />
          Retour à la boutique
        </Button>
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="relative aspect-square bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-12"
            priority
          />
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-6">
            <h1 className="text-4xl font-serif mb-2">{product.name}</h1>
            <p className="text-xl text-muted-foreground">{product.description}</p>
          </div>

          <div className="flex gap-4 mb-6">
            <Badge variant="secondary" className="text-sm py-1 px-3">
              {product.alcohol}% vol.
            </Badge>
            <Badge variant="outline" className="text-sm py-1 px-3">
              {product.volume}
            </Badge>
            {product.serving_size && (
              <Badge variant="outline" className="text-sm py-1 px-3">
                Service: {product.serving_size}
              </Badge>
            )}
          </div>

          <Separator className="my-6" />

          {/* Ingredients */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Composition
            </h3>
            <ul className="space-y-2">
              {product.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center gap-2 text-muted-foreground">
                  <span className="w-2 h-2 bg-primary rounded-full" />
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>

          {/* Serving Instructions */}
          {product.serving_instructions && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Wine className="h-5 w-5" />
                Comment servir
              </h3>
              <p className="text-muted-foreground">{product.serving_instructions}</p>
            </div>
          )}

          <Separator className="my-6" />

          {/* Price and Add to Cart */}
          <div className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Prix unitaire</p>
                <p className="text-3xl font-bold">{product.price}€</p>
              </div>
              <div className="w-32">
                <label className="text-sm text-muted-foreground mb-2 block">Quantité</label>
                <Select value={quantity} onValueChange={setQuantity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 12].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} bouteille{num > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={handleAddToCart}
              className="w-full gap-2" 
              size="lg"
              disabled={!product.available}
            >
              <ShoppingCart className="h-5 w-5" />
              Ajouter au panier - {(product.price * parseInt(quantity)).toFixed(2)}€
            </Button>

            {!product.available && (
              <p className="text-sm text-destructive text-center">
                Ce produit est temporairement indisponible
              </p>
            )}
          </div>

          {/* Additional Info */}
          <Card className="mt-6 bg-muted/40">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <Droplets className="h-4 w-4" />
                <span>L'abus d'alcool est dangereux pour la santé. À consommer avec modération.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-16">
        <h2 className="text-2xl font-serif mb-8">Vous pourriez aussi aimer</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {otherProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}