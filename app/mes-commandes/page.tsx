'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useUserOrders } from '@/hooks/use-user-orders'
import { OrdersList } from '@/components/user-orders/OrdersList'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ChevronLeft, ChevronRight, RefreshCw, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function MesCommandesPage() {
  const { user, loading: authLoading } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const { orders, loading, error, pagination, refetch } = useUserOrders(currentPage, 10)
  const router = useRouter()

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/connexion')
    }
  }, [user, authLoading, router])

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    refetch(newPage)
  }

  const handleRefresh = () => {
    refetch(currentPage)
  }

  // Show loading state during authentication check
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (redirect will happen)
  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              Mes commandes
            </h1>
            <p className="text-muted-foreground">
              Suivez l'état de vos commandes et consultez votre historique d'achats
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Link href="/">
              <Button size="sm">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Continuer mes achats
              </Button>
            </Link>
          </div>
        </div>
        <Separator className="mt-6" />
      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-destructive/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <span className="font-medium">Erreur :</span>
              <span>{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-2"
            >
              Réessayer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && orders.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement de vos commandes...</p>
          </div>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && (
        <>
          {pagination && pagination.total > 0 && (
            <div className="mb-4 text-sm text-muted-foreground">
              {pagination.total} commande{pagination.total > 1 ? 's' : ''} trouvée{pagination.total > 1 ? 's' : ''}
            </div>
          )}
          
          <OrdersList orders={orders} />

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-muted-foreground">
                Page {pagination.page} sur {pagination.totalPages}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    } else {
                      pageNum = pagination.page - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || loading}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}