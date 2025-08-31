"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/lib/store";
import { ShoppingCart, ChevronDown } from "lucide-react";
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
  const [quantity, setQuantity] = useState(1);
  const addItem = useCart((state) => state.addItem);
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
      title: "Ajouté au panier",
      description: `${quantity} x ${product.name} ${quantity > 1 ? 'ont' : 'a'} été ajouté${quantity > 1 ? 's' : ''} à votre panier`,
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <Link href={`/produit/${product.slug}`}>
        <div className="aspect-square relative bg-gradient-to-b from-muted/20 to-muted/40 overflow-hidden cursor-pointer">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-8 group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[70px] px-2">
                {quantity}
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {[...Array(10)].map((_, i) => (
                <DropdownMenuItem 
                  key={i + 1} 
                  onClick={() => setQuantity(i + 1)}
                  className="cursor-pointer"
                >
                  {i + 1} {i === 0 ? 'bouteille' : 'bouteilles'}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button 
            onClick={handleAddToCart}
            className="flex-1 gap-2"
            disabled={!product.available}
          >
            <ShoppingCart className="h-4 w-4" />
            Ajouter au panier
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}