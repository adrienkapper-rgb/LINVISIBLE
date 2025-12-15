import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative bg-gradient-to-b from-muted/20 to-muted/40">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-6">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-12 ml-2" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[70px]" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}