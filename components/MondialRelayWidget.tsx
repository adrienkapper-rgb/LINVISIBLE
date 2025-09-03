'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, Search, Clock, Phone, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { SUPPORTED_COUNTRIES } from '@/lib/shipping/mondial-relay-pricing'
import { validatePostalCode, formatPostalCodeInput, getPostalFormat } from '@/lib/postal-formats'

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
  autoOpen?: boolean
}

export function MondialRelayWidget({ onPointSelected, selectedPoint, countryCode = 'FR', autoOpen = false }: MondialRelayWidgetProps) {
  const [isOpen, setIsOpen] = useState(autoOpen)
  const [selectedCountryForPickup, setSelectedCountryForPickup] = useState(countryCode)
  const [searchData, setSearchData] = useState({
    codePostal: '',
    ville: ''
  })
  const [points, setPoints] = useState<PointRelais[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isValidPostalCode, setIsValidPostalCode] = useState(true)
  const { toast } = useToast()

  // Filtrer les pays avec Point Relais disponible
  const availableCountries = Object.values(SUPPORTED_COUNTRIES)
    .filter(country => country.pointRelaisAvailable)
    .sort((a, b) => a.name.localeCompare(b.name))

  // Obtenir le format postal pour le pays sélectionné
  const postalFormat = getPostalFormat(selectedCountryForPickup)

  // Synchroniser le pays du widget avec le pays de facturation de l'utilisateur
  useEffect(() => {
    setSelectedCountryForPickup(countryCode);
    // Réinitialiser la recherche quand le pays de facturation change
    setPoints([]);
    setSearchData({ codePostal: '', ville: '' });
    setIsValidPostalCode(true);
  }, [countryCode]);

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
          countryCode: selectedCountryForPickup
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
            {/* Sélecteur de pays */}
            <div>
              <Label htmlFor="countryPickup">Pays de retrait *</Label>
              <Select 
                value={selectedCountryForPickup} 
                onValueChange={(value) => {
                  setSelectedCountryForPickup(value);
                  // Réinitialiser les résultats quand le pays change
                  setPoints([]);
                  setSearchData({ codePostal: '', ville: '' });
                  setIsValidPostalCode(true);
                }}
              >
                <SelectTrigger id="countryPickup">
                  <SelectValue placeholder="Sélectionnez un pays" />
                </SelectTrigger>
                <SelectContent>
                  {availableCountries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="codePostal">
                  Code postal *
                  {postalFormat && (
                    <span className="text-xs text-muted-foreground ml-1">
                      ({postalFormat.description})
                    </span>
                  )}
                </Label>
                <Input
                  id="codePostal"
                  value={searchData.codePostal}
                  onChange={(e) => {
                    const formatted = formatPostalCodeInput(e.target.value, selectedCountryForPickup);
                    setSearchData({...searchData, codePostal: formatted});
                    setIsValidPostalCode(validatePostalCode(formatted, selectedCountryForPickup));
                  }}
                  placeholder={postalFormat?.placeholder || "Code postal"}
                  maxLength={postalFormat?.maxLength || 10}
                  className={!isValidPostalCode && searchData.codePostal ? 'border-red-500' : ''}
                />
                {!isValidPostalCode && searchData.codePostal && postalFormat && (
                  <p className="text-xs text-red-500 mt-1">
                    Format attendu : {postalFormat.example}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="ville">Ville (optionnel)</Label>
                <Input
                  id="ville"
                  value={searchData.ville}
                  onChange={(e) => setSearchData({...searchData, ville: e.target.value})}
                  placeholder={selectedCountryForPickup === 'FR' ? 'Bordeaux' : selectedCountryForPickup === 'BE' ? 'Bruxelles' : selectedCountryForPickup === 'ES' ? 'Madrid' : selectedCountryForPickup === 'LU' ? 'Luxembourg' : selectedCountryForPickup === 'NL' ? 'Amsterdam' : 'Ville'}
                />
              </div>
            </div>
            
            <Button 
              onClick={searchPoints}
              disabled={isLoading || !searchData.codePostal || !isValidPostalCode}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Recherche en cours..." : "Rechercher des points relais"}
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
        <p>• Disponible dans {availableCountries.length} pays européens</p>
      </div>
    </div>
  )
}