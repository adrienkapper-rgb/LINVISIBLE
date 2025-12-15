import { ProductCardSkeleton } from "./ProductCardSkeleton";

interface ProductGridSkeletonProps {
  count?: number;
}

export function ProductGridSkeleton({ count = 6 }: ProductGridSkeletonProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}