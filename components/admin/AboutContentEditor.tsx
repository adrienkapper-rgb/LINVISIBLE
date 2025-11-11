'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AboutContent {
  hero: {
    title: string
    subtitle: string
  }
  artisan: {
    title: string
    paragraph_1: string
  }
  professionals: {
    title: string
    paragraph_1: string
    paragraph_2: string
  }
  editor: {
    title: string
    paragraph_1: string
    paragraph_2: string
  }
}

const emptyContent: AboutContent = {
  hero: { title: '', subtitle: '' },
  artisan: { title: '', paragraph_1: '' },
  professionals: { title: '', paragraph_1: '', paragraph_2: '' },
  editor: { title: '', paragraph_1: '', paragraph_2: '' },
}

export function AboutContentEditor() {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr')
  const [content, setContent] = useState<AboutContent>(emptyContent)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadContent(language)
  }, [language])

  const loadContent = async (lang: 'fr' | 'en') => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/about?lang=${lang}`)

      if (!response.ok) {
        throw new Error('Failed to load content')
      }

      const data = await response.json()
      setContent(data.sections)
    } catch (error) {
      console.error('Error loading content:', error)
      toast.error('Erreur lors du chargement du contenu')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/about', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          sections: content,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save content')
      }

      toast.success(
        `Contenu ${language.toUpperCase()} sauvegardé avec succès !`
      )
    } catch (error) {
      console.error('Error saving content:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const updateContent = (
    section: keyof AboutContent,
    field: string,
    value: string
  ) => {
    setContent((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Language Selector and Save Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Label htmlFor="language" className="text-sm font-medium">
            Langue :
          </Label>
          <Select value={language} onValueChange={(val) => setLanguage(val as 'fr' | 'en')}>
            <SelectTrigger id="language" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </>
          )}
        </Button>
      </div>

      {/* Split Screen: Editor (Left) + Preview (Right) */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Editor */}
        <div>
          <Accordion type="multiple" defaultValue={['hero', 'artisan', 'professionals', 'editor']} className="space-y-2">
            {/* Hero Section */}
            <AccordionItem value="hero">
              <AccordionTrigger className="text-lg font-semibold">
                Section Hero
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="hero-title">Titre principal</Label>
                  <Input
                    id="hero-title"
                    value={content.hero.title}
                    onChange={(e) => updateContent('hero', 'title', e.target.value)}
                    placeholder="Titre principal"
                  />
                </div>
                <div>
                  <Label htmlFor="hero-subtitle">Sous-titre</Label>
                  <Input
                    id="hero-subtitle"
                    value={content.hero.subtitle}
                    onChange={(e) => updateContent('hero', 'subtitle', e.target.value)}
                    placeholder="Sous-titre"
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Artisan Section */}
            <AccordionItem value="artisan">
              <AccordionTrigger className="text-lg font-semibold">
                Section Artisan
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="artisan-title">Titre</Label>
                  <Input
                    id="artisan-title"
                    value={content.artisan.title}
                    onChange={(e) => updateContent('artisan', 'title', e.target.value)}
                    placeholder="Titre"
                  />
                </div>
                <div>
                  <Label htmlFor="artisan-p1">Paragraphe</Label>
                  <Textarea
                    id="artisan-p1"
                    value={content.artisan.paragraph_1}
                    onChange={(e) => updateContent('artisan', 'paragraph_1', e.target.value)}
                    placeholder="Paragraphe"
                    rows={4}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Professionals Section */}
            <AccordionItem value="professionals">
              <AccordionTrigger className="text-lg font-semibold">
                Section Professionnels
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="professionals-title">Titre</Label>
                  <Input
                    id="professionals-title"
                    value={content.professionals.title}
                    onChange={(e) => updateContent('professionals', 'title', e.target.value)}
                    placeholder="Titre"
                  />
                </div>
                <div>
                  <Label htmlFor="professionals-p1">Paragraphe 1</Label>
                  <Textarea
                    id="professionals-p1"
                    value={content.professionals.paragraph_1}
                    onChange={(e) => updateContent('professionals', 'paragraph_1', e.target.value)}
                    placeholder="Premier paragraphe"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="professionals-p2">Paragraphe 2</Label>
                  <Textarea
                    id="professionals-p2"
                    value={content.professionals.paragraph_2}
                    onChange={(e) => updateContent('professionals', 'paragraph_2', e.target.value)}
                    placeholder="Deuxième paragraphe"
                    rows={3}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Editor Section */}
            <AccordionItem value="editor">
              <AccordionTrigger className="text-lg font-semibold">
                Section Éditeur
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="editor-title">Titre</Label>
                  <Input
                    id="editor-title"
                    value={content.editor.title}
                    onChange={(e) => updateContent('editor', 'title', e.target.value)}
                    placeholder="Titre"
                  />
                </div>
                <div>
                  <Label htmlFor="editor-p1">Paragraphe 1</Label>
                  <Textarea
                    id="editor-p1"
                    value={content.editor.paragraph_1}
                    onChange={(e) => updateContent('editor', 'paragraph_1', e.target.value)}
                    placeholder="Premier paragraphe"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="editor-p2">Paragraphe 2</Label>
                  <Textarea
                    id="editor-p2"
                    value={content.editor.paragraph_2}
                    onChange={(e) => updateContent('editor', 'paragraph_2', e.target.value)}
                    placeholder="Deuxième paragraphe"
                    rows={3}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Right: Live Preview */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-8">
                <div className="text-center border-b pb-6">
                  <p className="text-xs text-gray-500 mb-2">APERÇU EN DIRECT</p>
                  <h3 className="text-2xl font-serif font-bold mb-2">
                    {content.hero.title || 'Titre principal'}
                  </h3>
                  <p className="text-gray-600">
                    {content.hero.subtitle || 'Sous-titre'}
                  </p>
                </div>

                <div className="border-b pb-6">
                  <h4 className="text-xl font-serif font-bold mb-3">
                    {content.artisan.title || 'Titre Artisan'}
                  </h4>
                  <p className="text-gray-700 text-sm text-justify">
                    {content.artisan.paragraph_1 || 'Paragraphe artisan...'}
                  </p>
                </div>

                <div className="border-b pb-6 bg-gray-50 -mx-6 px-6 py-4">
                  <h4 className="text-xl font-serif font-bold mb-3 text-right">
                    {content.professionals.title || 'Titre Professionnels'}
                  </h4>
                  <p className="text-gray-700 text-sm mb-2 text-justify">
                    {content.professionals.paragraph_1 || 'Paragraphe 1...'}
                  </p>
                  <p className="text-gray-700 text-sm text-justify">
                    {content.professionals.paragraph_2 || 'Paragraphe 2...'}
                  </p>
                </div>

                <div>
                  <h4 className="text-xl font-serif font-bold mb-3">
                    {content.editor.title || 'Titre Éditeur'}
                  </h4>
                  <p className="text-gray-700 text-sm mb-2 text-justify">
                    {content.editor.paragraph_1 || 'Paragraphe 1...'}
                  </p>
                  <p className="text-gray-700 text-sm text-justify">
                    {content.editor.paragraph_2 || 'Paragraphe 2...'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
