'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, Plus, X, Wine, Beaker, History, ArrowUpDown, AlertTriangle, Factory, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { useForm } from 'react-hook-form'
import Image from 'next/image'
import { ImagePickerDialog } from '@/components/admin/ImagePickerDialog'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Product {
  id: string
  numero: number
  slug: string
  name: string
  price: number
  volume: string
  alcohol: number
  image_url?: string
  description?: string
  ingredients?: string[]
  serving_instructions?: string
  serving_size?: string
  available: boolean
  stock_quantity: number
  stock_internal: number
  low_stock_threshold: number
  weight: number
  created_at: string
  updated_at: string
}

interface ProductForm {
  numero: number
  slug: string
  name: string
  price: number
  volume: string
  alcohol: number
  image_url?: string
  description?: string
  ingredients: string[]
  serving_instructions?: string
  serving_size?: string
  available: boolean
  stock_quantity: number
  stock_internal: number
  low_stock_threshold: number
  weight: number
}

interface StockMovement {
  id: string
  movement_type: string
  quantity: number
  reference_type: string | null
  reference_id: string | null
  notes: string | null
  created_at: string
  created_by: string | null
}

interface StockStats {
  total_produced: number
  total_sold_web: number
  total_sold_square: number
  total_tasting_used: number
  total_adjustments: number
  total_losses: number
}

const movementTypeLabels: Record<string, { label: string; color: string }> = {
  production_sale: { label: 'Production (vente)', color: 'bg-green-100 text-green-800' },
  production_internal: { label: 'Production (dégust.)', color: 'bg-blue-100 text-blue-800' },
  web_sale: { label: 'Vente web', color: 'bg-purple-100 text-purple-800' },
  square_sale: { label: 'Vente Square', color: 'bg-orange-100 text-orange-800' },
  tasting_used: { label: 'Dégustation', color: 'bg-yellow-100 text-yellow-800' },
  adjustment: { label: 'Ajustement', color: 'bg-gray-100 text-gray-800' },
  loss: { label: 'Perte', color: 'bg-red-100 text-red-800' }
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ingredients, setIngredients] = useState<string[]>([''])

  // Stock management state
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [movementsLoading, setMovementsLoading] = useState(false)
  const [stats, setStats] = useState<StockStats | null>(null)
  const [movementFilter, setMovementFilter] = useState<string>('all')

  // Adjustment dialog
  const [adjustmentOpen, setAdjustmentOpen] = useState(false)
  const [adjustmentType, setAdjustmentType] = useState<'stock_sale' | 'stock_internal'>('stock_sale')
  const [adjustmentQuantity, setAdjustmentQuantity] = useState<number>(0)
  const [adjustmentReason, setAdjustmentReason] = useState('')
  const [adjustmentSubmitting, setAdjustmentSubmitting] = useState(false)

  // Tasting dialog
  const [tastingOpen, setTastingOpen] = useState(false)
  const [tastingQuantity, setTastingQuantity] = useState<number>(1)
  const [tastingNotes, setTastingNotes] = useState('')
  const [tastingSubmitting, setTastingSubmitting] = useState(false)

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<ProductForm>()

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
      fetchMovements(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (product) {
      const productIngredients = product.ingredients || ['']
      setIngredients(productIngredients.length > 0 ? productIngredients : [''])

      reset({
        numero: product.numero,
        slug: product.slug,
        name: product.name,
        price: product.price,
        volume: product.volume,
        alcohol: product.alcohol,
        image_url: product.image_url || '',
        description: product.description || '',
        ingredients: productIngredients,
        serving_instructions: product.serving_instructions || '',
        serving_size: product.serving_size || '',
        available: product.available,
        stock_quantity: product.stock_quantity,
        stock_internal: product.stock_internal || 0,
        low_stock_threshold: product.low_stock_threshold || 5,
        weight: product.weight
      })
    }
  }, [product, reset])

  const fetchProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`)
      if (!response.ok) throw new Error('Failed to fetch product')

      const data = await response.json()
      setProduct(data)
    } catch (error) {
      toast.error('Erreur lors du chargement du produit')
    } finally {
      setLoading(false)
    }
  }

  const fetchMovements = async (productId: string) => {
    try {
      setMovementsLoading(true)
      const response = await fetch(`/api/admin/products/${productId}/movements`)
      if (!response.ok) throw new Error('Failed to fetch movements')

      const data = await response.json()
      setMovements(data.movements)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching movements:', error)
    } finally {
      setMovementsLoading(false)
    }
  }

  const addIngredient = () => {
    setIngredients([...ingredients, ''])
  }

  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index)
    setIngredients(newIngredients)
    setValue('ingredients', newIngredients.filter(i => i.trim() !== ''))
  }

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients]
    newIngredients[index] = value
    setIngredients(newIngredients)
    setValue('ingredients', newIngredients.filter(i => i.trim() !== ''))
  }

  const onSubmit = async (data: ProductForm) => {
    if (!product) return

    try {
      setSaving(true)

      const productData = {
        ...data,
        ingredients: ingredients.filter(i => i.trim() !== '')
      }

      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (!response.ok) throw new Error('Failed to update product')

      const updatedProduct = await response.json()
      setProduct(updatedProduct)
      toast.success('Produit mis à jour avec succès')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du produit')
    } finally {
      setSaving(false)
    }
  }

  const handleAdjustment = async () => {
    if (!product || !adjustmentReason.trim()) {
      toast.error('Le motif est obligatoire')
      return
    }

    try {
      setAdjustmentSubmitting(true)

      const response = await fetch(`/api/admin/products/${product.id}/adjustment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock_type: adjustmentType,
          quantity: adjustmentQuantity,
          reason: adjustmentReason
        })
      })

      if (!response.ok) throw new Error('Failed to create adjustment')

      toast.success('Ajustement effectué')
      setAdjustmentOpen(false)
      setAdjustmentQuantity(0)
      setAdjustmentReason('')

      // Refresh data
      fetchProduct(product.id)
      fetchMovements(product.id)
    } catch (error) {
      toast.error('Erreur lors de l\'ajustement')
    } finally {
      setAdjustmentSubmitting(false)
    }
  }

  const handleUseTasting = async () => {
    if (!product || tastingQuantity <= 0) {
      toast.error('Quantité invalide')
      return
    }

    if (tastingQuantity > (product.stock_internal || 0)) {
      toast.error('Stock dégustation insuffisant')
      return
    }

    try {
      setTastingSubmitting(true)

      const response = await fetch(`/api/admin/products/${product.id}/use-tasting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quantity: tastingQuantity,
          notes: tastingNotes || null
        })
      })

      if (!response.ok) throw new Error('Failed to use tasting stock')

      toast.success('Stock dégustation utilisé')
      setTastingOpen(false)
      setTastingQuantity(1)
      setTastingNotes('')

      // Refresh data
      fetchProduct(product.id)
      fetchMovements(product.id)
    } catch (error) {
      toast.error('Erreur lors de l\'utilisation')
    } finally {
      setTastingSubmitting(false)
    }
  }

  const filteredMovements = movements.filter(m =>
    movementFilter === 'all' || m.movement_type === movementFilter
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Produit introuvable</h1>
        <Button onClick={() => router.back()}>
          Retour
        </Button>
      </div>
    )
  }

  const isLowStock = product.stock_quantity <= (product.low_stock_threshold || 5)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-muted-foreground">
            Créé le {new Date(product.created_at).toLocaleDateString('fr-FR')}
          </p>
        </div>
        {product.image_url && (
          <div className="relative w-16 h-16 flex-shrink-0">
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover rounded"
            />
          </div>
        )}
      </div>

      {/* Stock Management Section */}
      <Card className={isLowStock ? 'border-red-300' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isLowStock && <AlertTriangle className="h-5 w-5 text-red-500" />}
            Gestion du stock
          </CardTitle>
          <CardDescription>
            État actuel et historique des mouvements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stock Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className={isLowStock ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${isLowStock ? 'text-red-700' : 'text-green-700'}`}>
                  Stock vente
                </CardTitle>
                <Wine className={`h-4 w-4 ${isLowStock ? 'text-red-600' : 'text-green-600'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${isLowStock ? 'text-red-700' : 'text-green-700'}`}>
                  {product.stock_quantity || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Seuil alerte: ≤ {product.low_stock_threshold || 5}
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Stock dégustation</CardTitle>
                <Beaker className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                  {product.stock_internal || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total produit</CardTitle>
                <Factory className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.total_produced || 0}
                </div>
                <p className="text-xs text-muted-foreground">historique</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total vendu</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(stats?.total_sold_web || 0) + (stats?.total_sold_square || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Web: {stats?.total_sold_web || 0} | Square: {stats?.total_sold_square || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Dialog open={adjustmentOpen} onOpenChange={setAdjustmentOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  Ajustement manuel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajustement de stock</DialogTitle>
                  <DialogDescription>
                    Ajuster le stock manuellement (inventaire, correction d&apos;erreur...)
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Type de stock</Label>
                    <Select value={adjustmentType} onValueChange={(v) => setAdjustmentType(v as 'stock_sale' | 'stock_internal')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stock_sale">Stock vente (actuel: {product.stock_quantity})</SelectItem>
                        <SelectItem value="stock_internal">Stock dégustation (actuel: {product.stock_internal})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nouvelle quantité</Label>
                    <Input
                      type="number"
                      min="0"
                      value={adjustmentQuantity}
                      onChange={(e) => setAdjustmentQuantity(parseInt(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Différence: {adjustmentQuantity - (adjustmentType === 'stock_sale' ? product.stock_quantity : (product.stock_internal || 0))} unités
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Motif (obligatoire)</Label>
                    <Textarea
                      placeholder="Ex: Inventaire mensuel, correction erreur de saisie..."
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAdjustmentOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleAdjustment} disabled={adjustmentSubmitting || !adjustmentReason.trim()}>
                    {adjustmentSubmitting ? 'Enregistrement...' : 'Appliquer'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={tastingOpen} onOpenChange={setTastingOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={(product.stock_internal || 0) === 0}>
                  <Beaker className="h-4 w-4 mr-2" />
                  Utiliser dégustation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Utiliser le stock dégustation</DialogTitle>
                  <DialogDescription>
                    Enregistrer l&apos;utilisation de bouteilles pour dégustation
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Quantité utilisée</Label>
                    <Input
                      type="number"
                      min="1"
                      max={product.stock_internal || 0}
                      value={tastingQuantity}
                      onChange={(e) => setTastingQuantity(parseInt(e.target.value) || 1)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Stock disponible: {product.stock_internal || 0}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes (optionnel)</Label>
                    <Textarea
                      placeholder="Ex: Salon du vin Lyon, dégustation client..."
                      value={tastingNotes}
                      onChange={(e) => setTastingNotes(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setTastingOpen(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleUseTasting} disabled={tastingSubmitting || tastingQuantity <= 0}>
                    {tastingSubmitting ? 'Enregistrement...' : 'Confirmer'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Movements History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <History className="h-4 w-4" />
                Historique des mouvements
              </h3>
              <Select value={movementFilter} onValueChange={setMovementFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="production_sale">Production (vente)</SelectItem>
                  <SelectItem value="production_internal">Production (dégust.)</SelectItem>
                  <SelectItem value="web_sale">Vente web</SelectItem>
                  <SelectItem value="square_sale">Vente Square</SelectItem>
                  <SelectItem value="tasting_used">Dégustation</SelectItem>
                  <SelectItem value="adjustment">Ajustement</SelectItem>
                  <SelectItem value="loss">Perte</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {movementsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Quantité</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.slice(0, 20).map((movement) => (
                    <TableRow key={movement.id}>
                      <TableCell className="text-sm">
                        {format(new Date(movement.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </TableCell>
                      <TableCell>
                        <Badge className={movementTypeLabels[movement.movement_type]?.color || ''}>
                          {movementTypeLabels[movement.movement_type]?.label || movement.movement_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        <span className={movement.quantity >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {movement.quantity >= 0 ? '+' : ''}{movement.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {movement.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {filteredMovements.length === 0 && !movementsLoading && (
              <p className="text-center py-4 text-muted-foreground">
                Aucun mouvement enregistré
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations de base</CardTitle>
              <CardDescription>
                Informations principales du produit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="numero">Numéro du produit</Label>
                <Input
                  id="numero"
                  type="number"
                  {...register('numero', {
                    required: 'Le numéro est requis',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Le numéro doit être positif' }
                  })}
                />
                {errors.numero && (
                  <p className="text-sm text-red-600">{errors.numero.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom du produit</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'Le nom est requis' })}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  {...register('slug', { required: 'Le slug est requis' })}
                />
                {errors.slug && (
                  <p className="text-sm text-red-600">{errors.slug.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price', {
                      required: 'Le prix est requis',
                      valueAsNumber: true,
                      min: { value: 0, message: 'Le prix doit être positif' }
                    })}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volume">Volume</Label>
                  <Input
                    id="volume"
                    {...register('volume', { required: 'Le volume est requis' })}
                  />
                  {errors.volume && (
                    <p className="text-sm text-red-600">{errors.volume.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alcohol">Degré d&apos;alcool (%)</Label>
                <Input
                  id="alcohol"
                  type="number"
                  step="0.1"
                  {...register('alcohol', {
                    required: 'Le degré d\'alcool est requis',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Le degré doit être positif' },
                    max: { value: 100, message: 'Le degré ne peut pas dépasser 100%' }
                  })}
                />
                {errors.alcohol && (
                  <p className="text-sm text-red-600">{errors.alcohol.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image du produit</Label>
                <ImagePickerDialog
                  value={watch('image_url')}
                  onChange={(url) => setValue('image_url', url)}
                />
                {watch('image_url') && (
                  <div className="mt-2 relative w-full h-48 rounded-lg overflow-hidden border">
                    <Image
                      src={watch('image_url')!}
                      alt="Aperçu"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Détails</CardTitle>
              <CardDescription>
                Informations détaillées et paramètres
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  {...register('description')}
                />
              </div>

              <div className="space-y-2">
                <Label>Ingrédients</Label>
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      placeholder="Nom de l'ingrédient"
                    />
                    {ingredients.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeIngredient(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addIngredient}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un ingrédient
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="serving_size">Portion</Label>
                  <Input
                    id="serving_size"
                    {...register('serving_size')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Poids (g)</Label>
                  <Input
                    id="weight"
                    type="number"
                    {...register('weight', {
                      required: 'Le poids est requis',
                      valueAsNumber: true,
                      min: { value: 1, message: 'Le poids doit être positif' }
                    })}
                  />
                  {errors.weight && (
                    <p className="text-sm text-red-600">{errors.weight.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serving_instructions">Instructions de service</Label>
                <Textarea
                  id="serving_instructions"
                  rows={3}
                  {...register('serving_instructions')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="low_stock_threshold">Seuil d&apos;alerte stock</Label>
                <Input
                  id="low_stock_threshold"
                  type="number"
                  {...register('low_stock_threshold', {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Le seuil ne peut pas être négatif' }
                  })}
                />
                <p className="text-xs text-muted-foreground">
                  Alerte si stock vente ≤ cette valeur
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={watch('available')}
                  onCheckedChange={(checked) => setValue('available', checked)}
                />
                <Label htmlFor="available">Produit disponible</Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              'Enregistrement...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
