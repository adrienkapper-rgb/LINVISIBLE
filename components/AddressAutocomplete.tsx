'use client'

import { useEffect, useRef, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface AddressData {
  formatted: string
  street: string
  housenumber: string
  postcode: string
  city: string
  country: string
  country_code: string
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressData) => void
  selectedCountry: string
  disabled?: boolean
  label?: string
  placeholder?: string
  required?: boolean
}

interface GeoapifySuggestion {
  properties: {
    formatted?: string
    address_line1?: string
    address_line2?: string
    street?: string
    housenumber?: string
    postcode?: string
    city?: string
    town?: string
    village?: string
    country?: string
    country_code?: string
  }
}

export function AddressAutocomplete({
  onAddressSelect,
  selectedCountry,
  disabled = false,
  label = "Adresse",
  placeholder = "Tapez votre adresse...",
  required = false
}: AddressAutocompleteProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<GeoapifySuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const debounceRef = useRef<NodeJS.Timeout>()
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY

  console.log('🔧 AddressAutocomplete - API Key:', apiKey ? 'Present' : 'Missing')
  console.log('🔧 AddressAutocomplete - Selected Country:', selectedCountry)

  const fetchSuggestions = async (query: string) => {
    if (!apiKey) {
      console.error('🚨 Geoapify API key not found')
      setError('Configuration API manquante')
      return
    }

    if (!query || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const countryFilter = selectedCountry ? `&filter=countrycode:${selectedCountry.toLowerCase()}` : ''
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}${countryFilter}&lang=fr&limit=5&apiKey=${apiKey}`
      
      console.log('🌐 Fetching suggestions:', url)

      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      
      console.log('📥 API Response:', data)

      if (data.features) {
        setSuggestions(data.features)
        setShowSuggestions(data.features.length > 0)
        console.log(`✅ Found ${data.features.length} suggestions`)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
        console.log('❌ No suggestions found')
      }
    } catch (error) {
      console.error('🚨 Error fetching suggestions:', error)
      setError('Erreur lors de la récupération des suggestions')
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setSelectedIndex(-1)

    // Debounce les appels API
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value)
    }, 300)
  }

  const handleSuggestionSelect = (suggestion: GeoapifySuggestion) => {
    const props = suggestion.properties
    
    const addressData: AddressData = {
      formatted: props.formatted || '',
      street: props.street || props.address_line1 || '',
      housenumber: props.housenumber || '',
      postcode: props.postcode || '',
      city: props.city || props.town || props.village || '',
      country: props.country || '',
      country_code: props.country_code || ''
    }

    console.log('✅ Address selected:', addressData)

    setInputValue(addressData.formatted)
    setShowSuggestions(false)
    onAddressSelect(addressData)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex])
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  return (
    <div className="space-y-2">
      <Label htmlFor="address-autocomplete">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          ref={inputRef}
          id="address-autocomplete"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
          </div>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <div 
            ref={suggestionsRef}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                  index === selectedIndex ? 'bg-gray-100' : ''
                }`}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="text-sm font-medium text-gray-900">
                  {suggestion.properties.formatted}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-500 space-y-1">
          <p>{error}</p>
          <p className="text-xs">
            L'autocomplete n'est pas disponible mais vous pouvez saisir votre adresse manuellement.
          </p>
        </div>
      )}

      {!apiKey && (
        <div className="text-sm text-red-500 space-y-1">
          <p>Configuration requise: Ajoutez votre clé API Geoapify dans .env.local</p>
          <p className="text-xs">
            L'autocomplete n'est pas disponible mais vous pouvez saisir votre adresse manuellement.
          </p>
        </div>
      )}

      {!error && apiKey && (
        <p className="text-xs text-gray-500">
          Commencez à taper pour voir les suggestions d'adresses
        </p>
      )}
    </div>
  )
}