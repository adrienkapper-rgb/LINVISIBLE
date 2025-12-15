"use client";

import { useEffect, useState } from 'react';
import { useCart, CartItemLight } from '@/lib/store';
import { getProductsByIds } from '@/lib/api/products-client';
import { ProductCardData } from '@/lib/types/product';

export interface CartItemWithProduct {
  product: ProductCardData;
  quantity: number;
}

export function useCartWithProducts() {
  const { items: cartItems, updateQuantity, removeItem, clearCart, getTotalItems } = useCart();
  const [itemsWithProducts, setItemsWithProducts] = useState<CartItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      if (cartItems.length === 0) {
        setItemsWithProducts([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const productIds = cartItems.map(item => item.productId);
        const products = await getProductsByIds(productIds);

        // Create a map for quick lookup
        const productsMap = new Map(products.map(p => [p.id, p]));

        // Combine cart items with fresh product data
        const combined: CartItemWithProduct[] = cartItems
          .map(item => {
            const product = productsMap.get(item.productId);
            if (!product) return null; // Product might have been deleted
            return {
              product,
              quantity: item.quantity
            };
          })
          .filter((item): item is CartItemWithProduct => item !== null);

        setItemsWithProducts(combined);
      } catch (err) {
        console.error('Error fetching cart products:', err);
        setError('Impossible de charger les produits du panier');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [cartItems]);

  const getTotalPrice = () => {
    return itemsWithProducts.reduce(
      (total, item) => total + (item.product.price * item.quantity),
      0
    );
  };

  return {
    items: itemsWithProducts,
    isLoading,
    error,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice
  };
}
