"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/store";
import { ShoppingCart, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
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
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCart((state) => state.addItem);
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem(product, 1);
    toast({
      title: "Ajouté au panier",
      description: `${product.name} a été ajouté à votre panier`,
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="aspect-square relative bg-gradient-to-b from-muted/20 to-muted/40 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-8 group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <CardContent className="p-6">
        <h3 className="text-xl font-serif mb-2">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {product.description || ""}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-2xl font-bold">{product.price}€</span>
            <span className="text-sm text-muted-foreground ml-2">/{product.volume}</span>
          </div>
          <Badge variant="outline">{product.alcohol}% vol.</Badge>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleAddToCart}
            className="flex-1 gap-2"
            disabled={!product.available}
          >
            <ShoppingCart className="h-4 w-4" />
            Ajouter
          </Button>
          <Link href={`/produit/${product.slug}`} className="flex-1">
            <Button variant="outline" className="w-full gap-2">
              <Info className="h-4 w-4" />
              Détails
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}