'use client'

import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Pays couverts par Mondial Relay avec leurs codes ISO
const MONDIAL_RELAY_COUNTRIES = [
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪' },
  { code: 'NL', name: 'Pays-Bas', flag: '🇳🇱' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪' },
  { code: 'AT', name: 'Autriche', flag: '🇦🇹' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹' },
] as const

export type CountryCode = typeof MONDIAL_RELAY_COUNTRIES[number]['code']

interface CountrySelectProps {
  value: string
  onValueChange: (value: CountryCode) => void
  disabled?: boolean
  label?: string
  required?: boolean
}

export function CountrySelect({
  value,
  onValueChange,
  disabled = false,
  label = "Pays",
  required = false
}: CountrySelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="country-select">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        name="country"
        required={required}
      >
        <SelectTrigger id="country-select">
          <SelectValue placeholder="Sélectionner un pays" />
        </SelectTrigger>
        <SelectContent>
          {MONDIAL_RELAY_COUNTRIES.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              <span className="flex items-center gap-2">
                <span className="text-lg">{country.flag}</span>
                <span>{country.name}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Livraison disponible uniquement dans les pays listés via Mondial Relay
      </p>
    </div>
  )
}

export { MONDIAL_RELAY_COUNTRIES }