"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, ChevronLeft, Wine, Droplets, FlaskConical } from "lucide-react";
import { formatProductName } from "@/lib/utils/product";
import { ProductDetailsData } from "@/lib/types/product";

interface ProductDetailsProps {
  product: ProductDetailsData;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState("1");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customQuantity, setCustomQuantity] = useState("");
  const addItem = useCart((state) => state.addItem);
  const { toast } = useToast();

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": formatProductName(product.numero, product.name),
    "description": product.description,
    "image": product.image,
    "brand": {
      "@type": "Brand",
      "name": "L'invisible"
    },
    "manufacturer": {
      "@type": "Organization",
      "name": "L'invisible",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Bordeaux",
        "addressCountry": "FR"
      }
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "EUR",
      "availability": product.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "url": `https://www.cocktails-linvisible.fr/produit/${product.slug}`,
      "seller": {
        "@type": "Organization",
        "name": "L'invisible"
      }
    },
    "category": "Cocktails",
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Volume",
        "value": product.volume
      },
      {
        "@type": "PropertyValue", 
        "name": "Teneur en alcool",
        "value": `${product.alcohol}% vol.`
      },
      {
        "@type": "PropertyValue",
        "name": "Poids",
        "value": `${product.weight}g`
      }
    ],
    "ingredient": product.ingredients,
    "url": `https://www.cocktails-linvisible.fr/produit/${product.slug}`
  };

  const handleQuantityChange = (value: string) => {
    if (value === "custom") {
      setShowCustomInput(true);
      setCustomQuantity("");
    } else {
      setShowCustomInput(false);
      setQuantity(value);
    }
  };

  const handleCustomQuantityChange = (value: string) => {
    const numValue = parseInt(value);
    if (value === "" || (numValue >= 1 && numValue <= 999)) {
      setCustomQuantity(value);
      if (numValue >= 1) {
        setQuantity(value);
      }
    }
  };

  const getCurrentQuantity = () => {
    return showCustomInput ? customQuantity : quantity;
  };

  const getValidQuantity = () => {
    const current = getCurrentQuantity();
    const num = parseInt(current);
    return isNaN(num) || num < 1 ? 1 : num;
  };

  const handleAddToCart = () => {
    const qty = getValidQuantity();
    addItem(product, qty);
    toast({
      title: "Ajouté au panier",
      description: `${qty} x ${product.name} ajouté${qty > 1 ? 's' : ''} à votre panier`,
    });
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema),
        }}
      />
      <div className="container px-4 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2">
            <ChevronLeft className="h-4 w-4" />
            Retour au catalogue
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
            <h1 className="text-4xl font-serif mb-2">{formatProductName(product.numero, product.name)}</h1>
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
            <h3 className="text-lg font-semibold mb-3">
              Composition
            </h3>
            <ul className="space-y-2">
              {product.ingredients.slice().reverse().map((ingredient, index) => (
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
              <h3 className="text-lg font-semibold mb-3">
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
                {showCustomInput ? (
                  <Input
                    type="number"
                    value={customQuantity}
                    onChange={(e) => handleCustomQuantityChange(e.target.value)}
                    placeholder="Quantité"
                    min="1"
                    max="999"
                    autoFocus
                  />
                ) : (
                  <Select value={quantity} onValueChange={handleQuantityChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} bouteille{num > 1 ? 's' : ''}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">+ Autre quantité</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            <Button 
              onClick={handleAddToCart}
              className="w-full gap-2" 
              size="lg"
              disabled={!product.available}
            >
              <ShoppingCart className="h-5 w-5" />
              Ajouter au panier - {(product.price * getValidQuantity()).toFixed(2)}€
            </Button>

            {!product.available && (
              <p className="text-sm text-destructive text-center">
                Ce produit est temporairement indisponible
              </p>
            )}
          </div>

        </div>
      </div>
      </div>
    </>
  );
}