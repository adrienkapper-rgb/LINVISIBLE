'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Save, Image as ImageIcon, FileText } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { ImagePickerDialog } from '@/components/admin/ImagePickerDialog'
import { AboutContentEditor } from '@/components/admin/AboutContentEditor'

interface InterfaceSettings {
  id: number
  hero_image_url: string
  updated_at: string
}

export default function InterfacePage() {
  const router = useRouter()
  const [settings, setSettings] = useState<InterfaceSettings | null>(null)
  const [heroImageUrl, setHeroImageUrl] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/interface')

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des paramètres')
      }

      const data = await response.json()
      setSettings(data)
      setHeroImageUrl(data.hero_image_url)
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Impossible de charger les paramètres')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!heroImageUrl) {
      toast.error('Veuillez sélectionner une image pour le hero')
      return
    }

    try {
      setSaving(true)
      const response = await fetch('/api/admin/interface', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hero_image_url: heroImageUrl,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde')
      }

      const updatedSettings = await response.json()
      setSettings(updatedSettings)
      toast.success('Paramètres sauvegardés avec succès')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleImageChange = (imageUrl: string) => {
    setHeroImageUrl(imageUrl)
    toast.success('Image sélectionnée')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Paramètres d'interface</h1>
          <p className="text-gray-500 mt-1">
            Gérer l'apparence de votre site
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="hero">
            <ImageIcon className="h-4 w-4 mr-2" />
            Image Hero
          </TabsTrigger>
          <TabsTrigger value="about">
            <FileText className="h-4 w-4 mr-2" />
            Page À propos
          </TabsTrigger>
        </TabsList>

        {/* Tab: Hero Image */}
        <TabsContent value="hero" className="space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Sauvegarde...' : 'Enregistrer'}
            </Button>
          </div>

          <Card>
        <CardHeader>
          <CardTitle>Image du Hero</CardTitle>
          <CardDescription>
            Image principale affichée sur la page d'accueil
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Image Preview */}
          {heroImageUrl ? (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Aperçu
              </label>
              <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={heroImageUrl}
                  alt="Hero preview"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Aucune image sélectionnée</p>
              </div>
            </div>
          )}

          {/* Image Picker */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              {heroImageUrl ? 'Changer l\'image' : 'Sélectionner une image'}
            </label>
            <ImagePickerDialog
              value={heroImageUrl}
              onChange={handleImageChange}
            />
          </div>

          {/* Image URL Display */}
          {heroImageUrl && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                URL de l'image
              </label>
              <input
                type="text"
                value={heroImageUrl}
                readOnly
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50 text-gray-600"
              />
            </div>
          )}
        </CardContent>
      </Card>

          {/* Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Dernière mise à jour :</strong>{' '}
                {settings?.updated_at
                  ? new Date(settings.updated_at).toLocaleString('fr-FR')
                  : 'Jamais'}
              </p>
              <p className="text-xs text-gray-500 mt-4">
                L'image du hero sera automatiquement mise à jour sur la page d'accueil
                après la sauvegarde.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: About Page */}
        <TabsContent value="about">
          <AboutContentEditor />
        </TabsContent>
      </Tabs>
    </div>
  )
}
