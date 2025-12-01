'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ArrowLeft, Save, Factory, Wine, Beaker } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'

interface Product {
  id: string
  name: string
  stock_quantity: number
  stock_internal: number
}

interface ProductionInput {
  productId: string
  quantityProduced: number
  quantityForSale: number
  quantityInternal: number
}

export default function NewFabricationPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [sessionDate, setSessionDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [notes, setNotes] = useState('')
  const [productionInputs, setProductionInputs] = useState<Record<string, ProductionInput>>({})

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/products')
      if (!response.ok) throw new Error('Failed to fetch products')

      const data = await response.json()
      setProducts(data)

      // Initialize production inputs for each product
      const initialInputs: Record<string, ProductionInput> = {}
      data.forEach((product: Product) => {
        initialInputs[product.id] = {
          productId: product.id,
          quantityProduced: 0,
          quantityForSale: 0,
          quantityInternal: 0
        }
      })
      setProductionInputs(initialInputs)
    } catch (error) {
      toast.error('Erreur lors du chargement des produits')
    } finally {
      setLoading(false)
    }
  }

  const updateProductInput = (
    productId: string,
    field: 'quantityProduced' | 'quantityForSale' | 'quantityInternal',
    value: number
  ) => {
    setProductionInputs(prev => {
      const current = prev[productId]
      const updated = { ...current, [field]: value }

      // Auto-calculate internal when produced and sale are filled
      if (field === 'quantityProduced' || field === 'quantityForSale') {
        if (field === 'quantityProduced') {
          // If produced changes, keep sale the same and adjust internal
          updated.quantityInternal = Math.max(0, value - updated.quantityForSale)
        } else if (field === 'quantityForSale') {
          // If sale changes, adjust internal
          updated.quantityInternal = Math.max(0, updated.quantityProduced - value)
        }
      }

      // If internal is manually changed, adjust sale
      if (field === 'quantityInternal') {
        updated.quantityForSale = Math.max(0, updated.quantityProduced - value)
      }

      return { ...prev, [productId]: updated }
    })
  }

  const getTotals = () => {
    const items = Object.values(productionInputs).filter(i => i.quantityProduced > 0)
    return {
      products: items.length,
      produced: items.reduce((sum, i) => sum + i.quantityProduced, 0),
      forSale: items.reduce((sum, i) => sum + i.quantityForSale, 0),
      internal: items.reduce((sum, i) => sum + i.quantityInternal, 0)
    }
  }

  const validateInputs = () => {
    const items = Object.values(productionInputs).filter(i => i.quantityProduced > 0)

    if (items.length === 0) {
      toast.error('Ajoutez au moins un produit avec une quantité > 0')
      return false
    }

    for (const item of items) {
      if (item.quantityForSale + item.quantityInternal !== item.quantityProduced) {
        const product = products.find(p => p.id === item.productId)
        toast.error(`${product?.name}: la somme vente + dégustation doit égaler le total produit`)
        return false
      }
    }

    return true
  }

  const handleSubmit = async () => {
    if (!validateInputs()) return

    try {
      setSaving(true)

      const items = Object.values(productionInputs)
        .filter(i => i.quantityProduced > 0)
        .map(i => ({
          product_id: i.productId,
          quantity_produced: i.quantityProduced,
          quantity_for_sale: i.quantityForSale,
          quantity_internal: i.quantityInternal
        }))

      const response = await fetch('/api/admin/fabrication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_date: sessionDate,
          notes: notes || null,
          items
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create session')
      }

      toast.success('Session de fabrication créée avec succès')
      router.push('/admin/fabrication')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création')
    } finally {
      setSaving(false)
    }
  }

  const totals = getTotals()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Nouvelle session de fabrication</h1>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Nouvelle session de fabrication</h1>
      </div>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de la session</CardTitle>
          <CardDescription>Date et notes optionnelles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="session_date">Date de fabrication</Label>
              <Input
                id="session_date"
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                placeholder="Ex: Batch spécial Noël, nouvelles recettes testées..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.products}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total produit</CardTitle>
            <Wine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.produced}</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Pour vente</CardTitle>
            <Wine className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{totals.forSale}</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Dégustation</CardTitle>
            <Beaker className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{totals.internal}</div>
          </CardContent>
        </Card>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quantités produites par produit</CardTitle>
          <CardDescription>
            Remplissez uniquement les produits fabriqués. La quantité dégustation est calculée automatiquement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead className="text-center">Stock actuel (vente)</TableHead>
                <TableHead className="text-center">Stock actuel (dégustation)</TableHead>
                <TableHead className="text-center w-32">Qté produite</TableHead>
                <TableHead className="text-center w-32">Qté vente</TableHead>
                <TableHead className="text-center w-32">Qté dégustation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const input = productionInputs[product.id]
                const isValid = !input?.quantityProduced ||
                  input.quantityForSale + input.quantityInternal === input.quantityProduced

                return (
                  <TableRow
                    key={product.id}
                    className={input?.quantityProduced > 0 ? 'bg-green-50' : ''}
                  >
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {product.stock_quantity}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {product.stock_internal}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        value={input?.quantityProduced || ''}
                        onChange={(e) => updateProductInput(
                          product.id,
                          'quantityProduced',
                          parseInt(e.target.value) || 0
                        )}
                        className="text-center"
                        placeholder="0"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={input?.quantityProduced || 0}
                        value={input?.quantityForSale || ''}
                        onChange={(e) => updateProductInput(
                          product.id,
                          'quantityForSale',
                          parseInt(e.target.value) || 0
                        )}
                        className={`text-center ${!isValid ? 'border-red-500' : ''}`}
                        placeholder="0"
                        disabled={!input?.quantityProduced}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        max={input?.quantityProduced || 0}
                        value={input?.quantityInternal || ''}
                        onChange={(e) => updateProductInput(
                          product.id,
                          'quantityInternal',
                          parseInt(e.target.value) || 0
                        )}
                        className={`text-center ${!isValid ? 'border-red-500' : ''}`}
                        placeholder="0"
                        disabled={!input?.quantityProduced}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => router.back()}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={saving || totals.products === 0}>
          {saving ? (
            'Enregistrement...'
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer la session
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
