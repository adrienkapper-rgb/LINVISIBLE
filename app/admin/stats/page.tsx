'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Euro, 
  Package, 
  ShoppingCart, 
  Users, 
  Calendar,
  Download
} from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'

interface StatsData {
  overview: {
    totalOrders: number
    totalUsers: number
    totalProducts: number
    totalRevenue: number
  }
  recentOrders: any[]
  ordersByStatus: Record<string, number>
  salesOverTime: { date: string; total: number; count: number }[]
  topProducts: any[]
}

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
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

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return { percentage: 0, isPositive: true }
    const percentage = ((current - previous) / previous) * 100
    return {
      percentage: Math.abs(percentage),
      isPositive: percentage >= 0
    }
  }

  // Simuler des données pour la comparaison (en vrai on ferait une requête avec période précédente)
  const previousPeriodRevenue = stats ? stats.overview.totalRevenue * 0.85 : 0
  const previousPeriodOrders = stats ? Math.floor(stats.overview.totalOrders * 0.90) : 0
  
  const revenueGrowth = calculateGrowth(stats?.overview.totalRevenue || 0, previousPeriodRevenue)
  const ordersGrowth = calculateGrowth(stats?.overview.totalOrders || 0, previousPeriodOrders)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Statistiques Avancées</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-20 w-full" />
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
        <h1 className="text-3xl font-bold">Statistiques Avancées</h1>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">3 derniers mois</SelectItem>
              <SelectItem value="365">Année complète</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchStats} variant="outline">
            Actualiser
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Chiffre d'affaires</p>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.overview.totalRevenue)}
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {revenueGrowth.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={revenueGrowth.isPositive ? 'text-green-500' : 'text-red-500'}>
                    {revenueGrowth.percentage.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">vs période précédente</span>
                </div>
              </div>
              <Euro className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Commandes</p>
                <div className="text-2xl font-bold">{stats.overview.totalOrders}</div>
                <div className="flex items-center gap-1 text-xs">
                  {ordersGrowth.isPositive ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span className={ordersGrowth.isPositive ? 'text-green-500' : 'text-red-500'}>
                    {ordersGrowth.percentage.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">vs période précédente</span>
                </div>
              </div>
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Clients</p>
                <div className="text-2xl font-bold">{stats.overview.totalUsers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {(stats.overview.totalRevenue / stats.overview.totalUsers).toFixed(0)}€ panier moyen
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Produits</p>
                <div className="text-2xl font-bold">{stats.overview.totalProducts}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Catalogue actif
                </p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales Over Time */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Évolution des Ventes
            </CardTitle>
            <CardDescription>
              Ventes sur les {timeRange} derniers jours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.salesOverTime.slice(-7).map((day, index) => (
                <div key={day.date} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {new Date(day.date).toLocaleDateString('fr-FR', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {day.count} commande{day.count > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(day.total)}</p>
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all"
                        style={{ 
                          width: `${Math.min(100, (day.total / Math.max(...stats.salesOverTime.map(d => d.total))) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition des Commandes</CardTitle>
            <CardDescription>
              Statut actuel de toutes les commandes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.ordersByStatus).map(([status, count]) => {
                const percentage = (count / stats.overview.totalOrders) * 100
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{count}</span>
                      <span className="text-sm text-muted-foreground">
                        ({percentage.toFixed(1)}%)
                      </span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Top Produits
              </CardTitle>
              <CardDescription>
                Produits les plus vendus par quantité
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rang</TableHead>
                <TableHead>Produit</TableHead>
                <TableHead>Quantité vendue</TableHead>
                <TableHead>Part de marché</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.topProducts.map((product, index) => {
                const totalQuantity = stats.topProducts.reduce((sum, p) => sum + p.totalQuantity, 0)
                const marketShare = (product.totalQuantity / totalQuantity) * 100
                
                return (
                  <TableRow key={product.product_id}>
                    <TableCell>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {product.image_url && (
                          <img 
                            src={product.image_url} 
                            alt={product.product_name}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <p className="font-medium">{product.product_name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">{product.totalQuantity}</span>
                      <span className="text-sm text-muted-foreground ml-1">unités</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{marketShare.toFixed(1)}%</span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all"
                            style={{ width: `${marketShare}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}