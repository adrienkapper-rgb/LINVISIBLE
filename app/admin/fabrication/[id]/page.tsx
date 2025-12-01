'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Factory, Wine, Beaker, Calendar, User, FileText, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ProductionItem {
  id: string
  product_id: string
  quantity_produced: number
  quantity_for_sale: number
  quantity_internal: number
  product: {
    id: string
    name: string
    slug: string
  }
}

interface ProductionSessionDetail {
  id: string
  session_date: string
  notes: string | null
  created_at: string
  created_by: string | null
  items: ProductionItem[]
  creator?: {
    email: string
    first_name: string
    last_name: string
  }
}

export default function FabricationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.id as string

  const [session, setSession] = useState<ProductionSessionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (sessionId) {
      fetchSession()
    }
  }, [sessionId])

  const fetchSession = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/fabrication/${sessionId}`)
      if (!response.ok) {
        if (response.status === 404) {
          toast.error('Session non trouvée')
          router.push('/admin/fabrication')
          return
        }
        throw new Error('Failed to fetch session')
      }

      const data = await response.json()
      setSession(data)
    } catch (error) {
      toast.error('Erreur lors du chargement de la session')
    } finally {
      setLoading(false)
    }
  }

  const deleteSession = async () => {
    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/fabrication/${sessionId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete session')

      toast.success('Session supprimée avec succès')
      router.push('/admin/fabrication')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-9 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const totals = {
    products: session.items.length,
    produced: session.items.reduce((sum, i) => sum + i.quantity_produced, 0),
    forSale: session.items.reduce((sum, i) => sum + i.quantity_for_sale, 0),
    internal: session.items.reduce((sum, i) => sum + i.quantity_internal, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              Session du {format(new Date(session.session_date), 'dd MMMM yyyy', { locale: fr })}
            </h1>
            <p className="text-muted-foreground">
              Créée le {format(new Date(session.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
            </p>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={deleting}>
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer cette session de fabrication ?
                <br /><br />
                <strong className="text-red-600">
                  Attention : Le stock sera automatiquement décrémenté de {totals.produced} bouteilles
                  ({totals.forSale} vente + {totals.internal} dégustation).
                </strong>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={deleteSession}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {format(new Date(session.session_date), 'dd MMM yyyy', { locale: fr })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total produit</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.produced}</div>
            <p className="text-xs text-muted-foreground">{totals.products} produit(s)</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Stock vente</CardTitle>
            <Wine className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{totals.forSale}</div>
            <p className="text-xs text-green-600">
              {Math.round((totals.forSale / totals.produced) * 100)}% du total
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Stock dégustation</CardTitle>
            <Beaker className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{totals.internal}</div>
            <p className="text-xs text-blue-600">
              {Math.round((totals.internal / totals.produced) * 100)}% du total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Notes & Creator */}
      {(session.notes || session.creator) && (
        <div className="grid gap-4 md:grid-cols-2">
          {session.notes && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{session.notes}</p>
              </CardContent>
            </Card>
          )}

          {session.creator && (
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium">Créé par</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">
                  {session.creator.first_name} {session.creator.last_name}
                </p>
                <p className="text-xs text-muted-foreground">{session.creator.email}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wine className="h-5 w-5" />
            Détail de la production
          </CardTitle>
          <CardDescription>
            Répartition par produit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead className="text-center">Quantité produite</TableHead>
                <TableHead className="text-center">Pour vente</TableHead>
                <TableHead className="text-center">Pour dégustation</TableHead>
                <TableHead className="text-center">Répartition</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {session.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.product.name}</TableCell>
                  <TableCell className="text-center font-bold">
                    {item.quantity_produced}
                  </TableCell>
                  <TableCell className="text-center text-green-600 font-medium">
                    {item.quantity_for_sale}
                  </TableCell>
                  <TableCell className="text-center text-blue-600 font-medium">
                    {item.quantity_internal}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-1 justify-center">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {Math.round((item.quantity_for_sale / item.quantity_produced) * 100)}% vente
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {Math.round((item.quantity_internal / item.quantity_produced) * 100)}% dégust.
                      </Badge>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
