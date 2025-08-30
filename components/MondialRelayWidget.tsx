'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Search, Clock, Phone } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface PointRelais {
  Num: string
  LgAdr1: string
  LgAdr2?: string
  LgAdr3: string
  CP: string
  Ville: string
  Latitude: string
  Longitude: string
  Informations: string
}

interface MondialRelayWidgetProps {
  onPointSelected: (point: PointRelais) => void
  selectedPoint?: PointRelais | null
  countryCode?: string
}

export function MondialRelayWidget({ onPointSelected, selectedPoint, countryCode = 'FR' }: MondialRelayWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchData, setSearchData] = useState({
    codePostal: '',
    ville: ''
  })
  const [points, setPoints] = useState<PointRelais[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const searchPoints = async () => {
    if (!searchData.codePostal) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un code postal",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/mondial-relay/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...searchData,
          countryCode
        })
      })

      const result = await response.json()

      if (!result.success) {
        toast({
          title: "Erreur",
          description: result.error || "Erreur lors de la recherche",
          variant: "destructive"
        })
        return
      }

      setPoints(result.points || [])
      
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePointSelection = (point: PointRelais) => {
    onPointSelected(point)
    setIsOpen(false)
  }

  if (selectedPoint && !isOpen) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <p className="font-medium mb-1">Point relais sélectionné :</p>
          <div className="text-sm">
            <p className="font-medium">{selectedPoint.LgAdr1}</p>
            <p>{selectedPoint.LgAdr3}</p>
            <p>{selectedPoint.CP} {selectedPoint.Ville}</p>
          </div>
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => setIsOpen(true)}
          >
            Changer de point relais
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!isOpen ? (
        <Button 
          type="button"
          variant="outline" 
          className="w-full"
          onClick={() => setIsOpen(true)}
        >
          <MapPin className="mr-2 h-4 w-4" />
          Sélectionner un point relais
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Choisir un point relais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codePostal">Code postal *</Label>
                <Input
                  id="codePostal"
                  value={searchData.codePostal}
                  onChange={(e) => setSearchData({...searchData, codePostal: e.target.value})}
                  placeholder="33000"
                />
              </div>
              <div>
                <Label htmlFor="ville">Ville (optionnel)</Label>
                <Input
                  id="ville"
                  value={searchData.ville}
                  onChange={(e) => setSearchData({...searchData, ville: e.target.value})}
                  placeholder="Bordeaux"
                />
              </div>
            </div>
            
            <Button 
              onClick={searchPoints}
              disabled={isLoading || !searchData.codePostal}
              className="w-full"
            >
              <Search className="mr-2 h-4 w-4" />
              {isLoading ? "Recherche..." : "Rechercher des points relais"}
            </Button>

            {points.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                <p className="text-sm font-medium">{points.length} point(s) trouvé(s) :</p>
                {points.map((point) => (
                  <Card 
                    key={point.Num} 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handlePointSelection(point)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{point.LgAdr1}</p>
                          <p className="text-sm text-muted-foreground">{point.LgAdr3}</p>
                          <p className="text-sm text-muted-foreground">
                            {point.CP} {point.Ville}
                          </p>
                        </div>
                        <Badge variant="outline">{point.Num}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <Button 
              type="button"
              variant="ghost" 
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              Fermer
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="text-sm text-muted-foreground">
        <p>• Livraison sous 3-5 jours ouvrés</p>
        <p>• Retrait gratuit en point relais</p>
        <p>• Disponible dans toute la France</p>
      </div>
    </div>
  )
}