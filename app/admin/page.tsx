'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Euro, Package, ShoppingCart, Users, TrendingUp, AlertCircle, Globe, Store } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Stats {
  overview: {
    totalOrders: number
    totalUsers: number
    totalProducts: number
    totalRevenue: number
    webRevenue: number
    squareRevenue: number
  }
  recentOrders: any[]
  ordersByStatus: Record<string, number>
  salesOverTime: { date: string; total: number; count: number }[]
  topProducts: {
    product_id: string
    product_name: string
    image_url?: string
    totalQuantity: number
    webQuantity: number
    squareQuantity: number
  }[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      toast.error('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      processing: 'default',
      shipped: 'outline',
      delivered: 'default',
      cancelled: 'destructive'
    }
    
    const labels: Record<string, string> = {
      pending: 'En attente',
      processing: 'En cours',
      shipped: 'Expédié',
      delivered: 'Livré',
      cancelled: 'Annulé'
    }
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={fetchStats} variant="outline">
          Actualiser
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenu Total</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.overview.totalRevenue.toFixed(2)} €
            </div>
            <div className="flex gap-3 mt-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3" />
                Web: {stats.overview.webRevenue.toFixed(2)} €
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Store className="h-3 w-3" />
                POS: {stats.overview.squareRevenue.toFixed(2)} €
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {stats.ordersByStatus.pending || 0} en attente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Utilisateurs inscrits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overview.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Produits actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Commandes Récentes</CardTitle>
          <CardDescription>
            Les 5 dernières commandes reçues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.order_number}
                  </TableCell>
                  <TableCell>
                    {order.first_name} {order.last_name}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(order.status)}
                  </TableCell>
                  <TableCell>{order.total} €</TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString('fr-FR')}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="ghost" size="sm">
                        Voir
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Produits les plus vendus</CardTitle>
          <CardDescription>
            Top 5 des produits par quantité vendue (Web + Square POS)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topProducts.map((product, index) => (
              <div key={product.product_id} className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                  {index + 1}
                </div>
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.product_name}
                    className="w-10 h-10 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{product.product_name}</p>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{product.totalQuantity} vendus</span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      {product.webQuantity}
                    </span>
                    <span className="flex items-center gap-1">
                      <Store className="h-3 w-3" />
                      {product.squareQuantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {stats.topProducts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune vente enregistrée
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition des commandes</CardTitle>
          <CardDescription>
            Statut actuel de toutes les commandes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusBadge(status)}
                </div>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}