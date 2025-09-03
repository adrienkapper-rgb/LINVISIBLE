'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, User, MapPin, ShoppingCart, Crown, Users, Building } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

interface UserDetails {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  account_type?: 'particulier' | 'professionnel'
  company_name?: string
  country: string
  address_formatted: string
  postcode: string
  city: string
  country_code: string
  is_admin: boolean
  created_at: string
  updated_at: string
  orders: Array<{
    id: string
    order_number: string
    status: string
    total: number
    created_at: string
  }>
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchUser(params.id as string)
    }
  }, [params.id])

  const fetchUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch user')
      
      const data = await response.json()
      setUser(data)
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'utilisateur')
    } finally {
      setLoading(false)
    }
  }

  const updateAdminStatus = async (isAdmin: boolean) => {
    if (!user) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_admin: isAdmin })
      })

      if (!response.ok) throw new Error('Failed to update user')
      
      setUser(prev => prev ? { ...prev, is_admin: isAdmin } : null)
      toast.success(`Statut administrateur ${isAdmin ? 'accordé' : 'retiré'}`)
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut')
    } finally {
      setUpdating(false)
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

  const getAccountTypeBadge = (accountType?: string) => {
    if (!accountType) return null
    
    const config = {
      particulier: { variant: 'default' as const, icon: Users, label: 'Particulier' },
      professionnel: { variant: 'secondary' as const, icon: Building, label: 'Professionnel' }
    }
    
    const { variant, icon: Icon, label } = config[accountType as keyof typeof config] || config.particulier
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Utilisateur introuvable</h1>
        <Button onClick={() => router.back()}>
          Retour
        </Button>
      </div>
    )
  }

  const totalRevenue = user.orders
    .filter(order => ['processing', 'shipped', 'delivered'].includes(order.status))
    .reduce((sum, order) => sum + Number(order.total), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">
              {user.first_name} {user.last_name}
            </h1>
            {user.is_admin && (
              <Crown className="h-6 w-6 text-yellow-500" title="Administrateur" />
            )}
          </div>
          <p className="text-muted-foreground">{user.email}</p>
          <p className="text-sm text-muted-foreground">
            Inscrit le {new Date(user.created_at).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getAccountTypeBadge(user.account_type)}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Details */}
        <div className="space-y-6">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Prénom</Label>
                  <p className="text-sm text-muted-foreground">{user.first_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Nom</Label>
                  <p className="text-sm text-muted-foreground">{user.last_name}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              
              {user.phone && (
                <div>
                  <Label className="text-sm font-medium">Téléphone</Label>
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                </div>
              )}
              
              {user.company_name && (
                <div>
                  <Label className="text-sm font-medium">Entreprise</Label>
                  <p className="text-sm text-muted-foreground">{user.company_name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adresse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm">{user.address_formatted}</p>
              <p className="text-sm">{user.postcode} {user.city}</p>
              <p className="text-sm">{user.country}</p>
            </CardContent>
          </Card>

          {/* Admin Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Paramètres Administrateur</CardTitle>
              <CardDescription>
                Gérer les permissions de cet utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Statut Administrateur</Label>
                  <p className="text-sm text-muted-foreground">
                    Accorder les privilèges administrateur
                  </p>
                </div>
                <Switch
                  checked={user.is_admin}
                  onCheckedChange={updateAdminStatus}
                  disabled={updating}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders & Statistics */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{user.orders.length}</div>
                  <p className="text-sm text-muted-foreground">Commandes totales</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{totalRevenue.toFixed(2)} €</div>
                  <p className="text-sm text-muted-foreground">Chiffre d'affaires généré</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Commandes ({user.orders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.orders.length > 0 ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N° Commande</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.orders.slice(0, 10).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">
                            {order.order_number}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(order.status)}
                          </TableCell>
                          <TableCell className="font-medium">
                            {order.total} €
                          </TableCell>
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
                  
                  {user.orders.length > 10 && (
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">
                        Et {user.orders.length - 10} autres commandes...
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Aucune commande passée
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}