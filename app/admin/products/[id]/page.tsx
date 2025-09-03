'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { useForm } from 'react-hook-form'
import Image from 'next/image'

interface Product {
  id: string
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
  weight: number
  created_at: string
  updated_at: string
}

interface ProductForm {
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
  weight: number
}

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ingredients, setIngredients] = useState<string[]>([''])
  
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<ProductForm>()

  useEffect(() => {
    if (params.id) {
      fetchProduct(params.id as string)
    }
  }, [params.id])

  useEffect(() => {
    if (product) {
      const productIngredients = product.ingredients || ['']
      setIngredients(productIngredients.length > 0 ? productIngredients : [''])
      
      reset({
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
                <Label htmlFor="alcohol">Degré d'alcool (%)</Label>
                <Input
                  id="alcohol"
                  type="number"
                  step="0.1"
                  {...register('alcohol', { 
                    required: 'Le degré d\'alcool est requis',
                    min: { value: 0, message: 'Le degré doit être positif' },
                    max: { value: 100, message: 'Le degré ne peut pas dépasser 100%' }
                  })}
                />
                {errors.alcohol && (
                  <p className="text-sm text-red-600">{errors.alcohol.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL de l'image</Label>
                <Input
                  id="image_url"
                  type="url"
                  {...register('image_url')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Détails</CardTitle>
              <CardDescription>
                Informations détaillées et stock
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
                <Label htmlFor="stock_quantity">Stock disponible</Label>
                <Input
                  id="stock_quantity"
                  type="number"
                  {...register('stock_quantity', { 
                    required: 'Le stock est requis',
                    min: { value: 0, message: 'Le stock ne peut pas être négatif' }
                  })}
                />
                {errors.stock_quantity && (
                  <p className="text-sm text-red-600">{errors.stock_quantity.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  {...register('available')}
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