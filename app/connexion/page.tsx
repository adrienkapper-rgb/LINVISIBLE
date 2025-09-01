'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import CountrySelect from '@/components/CountrySelect'


export default function ConnexionPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState('FR')
  const router = useRouter()
  const { toast } = useToast()

  const handleAccountTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const companyField = document.getElementById('company-field')
    if (companyField) {
      if (e.target.value === 'professionnel') {
        companyField.style.display = 'block'
        const companyInput = document.getElementById('company') as HTMLInputElement
        if (companyInput) companyInput.required = true
      } else {
        companyField.style.display = 'none'
        const companyInput = document.getElementById('company') as HTMLInputElement
        if (companyInput) companyInput.required = false
      }
    }
  }


  const handleSignIn = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const result = await signIn(formData)
      if (result?.error) {
        toast({
          title: "Erreur de connexion",
          description: result.error,
          variant: "destructive"
        })
        setIsLoading(false)
      } else if (result?.success) {
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté"
        })
        setTimeout(() => {
          window.location.href = '/'
        }, 500)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion",
        variant: "destructive"
      })
      setIsLoading(false)
    }
  }

  const handleSignUp = async (formData: FormData) => {
    setIsLoading(true)
    try {
      const result = await signUp(formData)
      if (result?.error) {
        toast({
          title: "Erreur d'inscription",
          description: result.error,
          variant: "destructive"
        })
        setIsLoading(false)
      } else if (result?.success && result.user) {
        const firstName = result.user.user_metadata?.first_name || formData.get('firstName')
        toast({
          title: "Bienvenue !",
          description: `Bonjour ${firstName}, votre compte a été créé avec succès. Vous êtes maintenant connecté.`
        })
        setTimeout(() => {
          window.location.href = '/'
        }, 1500)
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'inscription",
        variant: "destructive"
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-lg mx-auto px-4 py-16">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-serif">L'invisible</CardTitle>
          <CardDescription>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isSignUp ? (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-medium mb-4">Connectez-vous</h2>
              </div>
              
              <form action={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Mot de passe</Label>
                  <Input
                    id="signin-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Connexion..." : "Se connecter"}
                </Button>
              </form>

              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Vous n'avez pas de compte, créez-en un
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsSignUp(true)}
                  disabled={isLoading}
                  className="w-full"
                >
                  Créer un compte
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-medium mb-4">Créer un compte</h2>
              </div>
              
              <form action={handleSignUp} className="space-y-4">
                {/* Hidden fields for country data */}
                <input type="hidden" name="country" value={selectedCountry} />
                <input type="hidden" name="country_code" value={selectedCountry.toLowerCase()} />
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="votre@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Mot de passe</Label>
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    minLength={6}
                    required
                    disabled={isLoading}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Le mot de passe doit contenir au moins 6 caractères
                </p>

                <div className="space-y-3">
                  <Label>Type de compte</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="accountType"
                        value="particulier"
                        defaultChecked
                        className="text-primary"
                        disabled={isLoading}
                        onChange={handleAccountTypeChange}
                      />
                      <span className="text-sm">Particulier</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="accountType"
                        value="professionnel"
                        className="text-primary"
                        disabled={isLoading}
                        onChange={handleAccountTypeChange}
                      />
                      <span className="text-sm">Professionnel</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2" id="company-field" style={{ display: 'none' }}>
                  <Label htmlFor="company">Nom de la société</Label>
                  <Input
                    id="company"
                    name="company"
                    type="text"
                    placeholder="Nom de votre société"
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="Votre prénom"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      placeholder="Votre nom"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <CountrySelect
                  value={selectedCountry}
                  onValueChange={setSelectedCountry}
                  disabled={isLoading}
                  required
                />

                <div className="space-y-2">
                  <Label htmlFor="address_formatted">Adresse complète</Label>
                  <Input
                    id="address_formatted"
                    name="address_formatted"
                    type="text"
                    placeholder="Votre adresse complète"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="postcode">Code postal</Label>
                    <Input
                      id="postcode"
                      name="postcode"
                      type="text"
                      placeholder="75001"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input
                      id="city"
                      name="city"
                      type="text"
                      placeholder="Paris"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="0123456789"
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Création..." : "Créer un compte"}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Vous avez déjà un compte ?
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsSignUp(false)}
                  disabled={isLoading}
                  className="w-full"
                >
                  Se connecter
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}