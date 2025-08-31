import { ProductCard } from "@/components/ProductCard";
import { getProducts, getProductImageUrl } from "@/lib/api/products";

export default async function BoutiquePage() {
  const products = await getProducts();
  return (
    <div className="container px-4 py-8 md:py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-serif mb-4">Notre Collection</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Découvrez notre gamme de cocktails artisanaux en premix, 
          élaborés avec soin pour offrir une expérience unique
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard 
            key={product.id} 
            product={{
              ...product,
              image: getProductImageUrl(product.image_url)
            }} 
          />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun produit disponible pour le moment.</p>
        </div>
      )}

      <div className="mt-16 bg-muted/40 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-serif mb-4">Comment servir nos cocktails</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Chaque cocktail L'invisible est conçu pour être simple à préparer. 
          Il suffit d'ajouter les accompagnements suggérés (tonic, cola, nectar...) 
          et des glaçons pour obtenir un cocktail parfait.
        </p>
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div>
            <div className="text-3xl mb-2">1</div>
            <p className="text-sm text-muted-foreground">
              Versez la quantité recommandée de premix
            </p>
          </div>
          <div>
            <div className="text-3xl mb-2">2</div>
            <p className="text-sm text-muted-foreground">
              Ajoutez l'accompagnement suggéré
            </p>
          </div>
          <div>
            <div className="text-3xl mb-2">3</div>
            <p className="text-sm text-muted-foreground">
              Complétez avec des glaçons et dégustez
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}