"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/lib/store";
import { StripePayment } from "@/components/StripePayment";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Package, CreditCard, AlertCircle, Globe, Edit2, Save } from "lucide-react";
import { saveUserInfo } from "@/app/actions/user";
import { MondialRelayWidget } from "@/components/MondialRelayWidget";
import { calculateTotalWeight, getShippingInfo, validatePackageWeight, SUPPORTED_COUNTRIES, getAvailableServices } from "@/lib/shipping/mondial-relay-pricing";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CheckoutFormProps {
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    countryCode?: string;
  } | null;
}

export function CheckoutForm({ user }: CheckoutFormProps) {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  
  
  const [formData, setFormData] = useState({
    email: user?.email || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    address: user?.address || "",
    city: user?.city || "",
    postalCode: user?.postalCode || "",
    country: user?.countryCode || "FR",
    mondialRelayPoint: "",
  });
  
  const [selectedRelayPoint, setSelectedRelayPoint] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState((user?.countryCode || 'FR').toUpperCase());
  const [preferPointRelais, setPreferPointRelais] = useState(true);

  // Mettre à jour automatiquement les champs si les données utilisateur changent
  useEffect(() => {
    if (user) {
      setFormData(prevData => ({
        ...prevData,
        email: user.email || prevData.email,
        firstName: user.firstName || prevData.firstName,
        lastName: user.lastName || prevData.lastName,
        phone: user.phone || prevData.phone,
        address: user.address || prevData.address,
        city: user.city || prevData.city,
        postalCode: user.postalCode || prevData.postalCode,
        country: user.countryCode || prevData.country,
      }));
      if (user.countryCode) {
        setSelectedCountry(user.countryCode.toUpperCase());
      }
    }
  }, [user]);

  // Obtenir les services disponibles pour le pays sélectionné
  const availableServices = getAvailableServices(selectedCountry);
  
  // Calcul dynamique du poids et du tarif
  const totalWeight = calculateTotalWeight(items);
  const shippingInfo = getShippingInfo(totalWeight, selectedCountry, preferPointRelais && availableServices.pointRelais);
  const shippingCost = shippingInfo.cost;
  const subtotal = getTotalPrice();
  const total = subtotal + shippingCost;
  
  // Validation du poids pour le pays sélectionné
  const weightValidation = validatePackageWeight(totalWeight, selectedCountry);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier le poids du colis
    if (!weightValidation.isValid) {
      toast({
        title: "Erreur",
        description: weightValidation.error,
        variant: "destructive",
      });
      return;
    }
    
    if (!acceptTerms) {
      toast({
        title: "Erreur",
        description: "Veuillez accepter les conditions générales de vente",
        variant: "destructive",
      });
      return;
    }

    // Vérifier la sélection du point relais uniquement si disponible et préféré
    if (availableServices.pointRelais && preferPointRelais && !selectedRelayPoint) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un point relais",
        variant: "destructive",
      });
      return;
    }

    // Vérifier que toutes les informations de contact sont remplies
    if (!formData.address.trim() || !formData.postalCode.trim() || !formData.city.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez renseigner une adresse complète dans vos informations de contact",
        variant: "destructive",
      });
      return;
    }

    // Sauvegarder les infos utilisateur si connecté
    if (user) {
      try {
        const saveData: any = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          countryCode: selectedCountry,
        };

        const result = await saveUserInfo(saveData);
        
        if (result.error) {
          console.error('Erreur sauvegarde utilisateur:', result.error);
          toast({
            title: "Avertissement",
            description: "Les informations de contact n'ont pas pu être sauvegardées pour les prochaines commandes.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Erreur sauvegarde utilisateur:', error);
      }
    }

    setShowPayment(true);
  };

  const handlePaymentSuccess = (orderNumber: string) => {
    clearCart();
    router.push(`/confirmation?order=${orderNumber}`);
  };

  const handlePaymentError = (error: string) => {
    toast({
      title: "Erreur de paiement",
      description: error,
      variant: "destructive",
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveInfo = async () => {
    if (!user) return;
    
    try {
      const result = await saveUserInfo({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        postalCode: formData.postalCode,
        countryCode: selectedCountry,
      });
      
      if (result.error) {
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder vos informations",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Succès",
          description: "Vos informations ont été mises à jour",
        });
        setIsEditingInfo(false);
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    }
  };

  const handleCountryChange = (countryCode: string) => {
    setSelectedCountry(countryCode);
    setFormData({
      ...formData,
      country: countryCode,
    });
    // Réinitialiser la sélection de point relais lors du changement de pays
    setSelectedRelayPoint(null);
    
    // Ajuster automatiquement le service selon la disponibilité
    const services = getAvailableServices(countryCode);
    if (!services.pointRelais) {
      setPreferPointRelais(false);
    }
  };

  const handleRelayPointSelection = (point: any) => {
    setSelectedRelayPoint(point);
    setFormData({
      ...formData,
      mondialRelayPoint: `${point.LgAdr1} - ${point.CP} ${point.Ville}`,
    });
  };

  // Déterminer si on peut procéder au paiement selon le mode de livraison
  const canProceedToPayment = () => {
    if (preferPointRelais && availableServices.pointRelais) {
      // Mode Point Relais : un point doit être sélectionné
      return selectedRelayPoint !== null;
    } else {
      // Mode Livraison à domicile : adresse complète requise
      return formData.address.trim() !== '' && 
             formData.postalCode.trim() !== '' && 
             formData.city.trim() !== '';
    }
  };

  if (items.length === 0) {
    return (
      <div className="container px-4 py-16 text-center">
        <p>Votre panier est vide.</p>
        <Link href="/boutique">
          <Button className="mt-4">Retour à la boutique</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <h1 className="text-3xl font-serif mb-8">Finaliser ma commande</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Informations de contact
                  </div>
                  {user && (
                    <Button
                      type="button"
                      variant={isEditingInfo ? "default" : "outline"}
                      size="sm"
                      onClick={() => isEditingInfo ? handleSaveInfo() : setIsEditingInfo(true)}
                    >
                      {isEditingInfo ? (
                        <>
                          <Save className="h-4 w-4 mr-1" />
                          Enregistrer
                        </>
                      ) : (
                        <>
                          <Edit2 className="h-4 w-4 mr-1" />
                          Modifier
                        </>
                      )}
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {/* Email */}
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!!user}
                      required
                    />
                  </div>

                  {/* Prénom et Nom */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={user && !isEditingInfo}
                        placeholder="Votre prénom"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={user && !isEditingInfo}
                        placeholder="Votre nom"
                        required
                      />
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={user && !isEditingInfo}
                      placeholder="Votre numéro de téléphone"
                      required
                    />
                  </div>

                  {/* Adresse */}
                  <div>
                    <Label htmlFor="address">Adresse *</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={user && !isEditingInfo}
                      placeholder="Numéro et nom de rue"
                      required
                    />
                  </div>

                  {/* Code postal et Ville */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Code postal *</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleInputChange}
                        disabled={user && !isEditingInfo}
                        placeholder="Code postal"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Ville *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        disabled={user && !isEditingInfo}
                        placeholder="Ville"
                        required
                      />
                    </div>
                  </div>

                  {/* Pays */}
                  <div>
                    <Label htmlFor="country">Pays *</Label>
                    <Select 
                      value={selectedCountry} 
                      onValueChange={handleCountryChange}
                      disabled={user && !isEditingInfo}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un pays" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(SUPPORTED_COUNTRIES).map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Mode de livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Service Selection */}
                {availableServices.pointRelais && availableServices.homeDelivery && (
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Mode de livraison</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="point-relais"
                          name="delivery-service"
                          checked={preferPointRelais}
                          onChange={() => {
                            setPreferPointRelais(true);
                            setSelectedRelayPoint(null);
                          }}
                        />
                        <Label htmlFor="point-relais" className="text-sm">
                          Point Relais (moins cher)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="home-delivery"
                          name="delivery-service"
                          checked={!preferPointRelais}
                          onChange={() => {
                            setPreferPointRelais(false);
                            setSelectedRelayPoint(null);
                          }}
                        />
                        <Label htmlFor="home-delivery" className="text-sm">
                          Livraison à domicile
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Info sur le service sélectionné */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm">
                        {shippingInfo.service === 'point-relais' ? 'Point Relais' : 'Livraison à domicile'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {shippingInfo.deliveryTime} • {shippingInfo.formattedWeight}
                      </p>
                    </div>
                    <p className="font-semibold">{shippingInfo.cost.toFixed(2)}€</p>
                  </div>
                </div>

                {/* Mondial Relay Widget si Point Relais sélectionné */}
                {availableServices.pointRelais && preferPointRelais && (
                  <MondialRelayWidget 
                    onPointSelected={handleRelayPointSelection}
                    selectedPoint={selectedRelayPoint}
                    countryCode={selectedCountry}
                  />
                )}

                {/* Info si livraison à domicile */}
                {(!availableServices.pointRelais || !preferPointRelais) && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      La livraison sera effectuée à l'adresse indiquée dans vos informations de contact.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Options */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed">
                    J'accepte les conditions générales de vente *
                  </Label>
                </div>
                
                {!user && (
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="account" 
                      checked={createAccount}
                      onCheckedChange={(checked) => setCreateAccount(checked as boolean)}
                    />
                    <Label htmlFor="account" className="text-sm leading-relaxed">
                      Créer un compte pour faciliter mes prochaines commandes
                    </Label>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Récapitulatif</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span>
                        {item.product.name} x {item.quantity}
                      </span>
                      <span>{(item.product.price * item.quantity).toFixed(2)}€</span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      {shippingInfo.service === 'point-relais' 
                        ? `Point Relais (${shippingInfo.formattedWeight})` 
                        : `Livraison à domicile (${shippingInfo.formattedWeight})`}
                    </span>
                    <span>{shippingCost.toFixed(2)}€</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total TTC</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
                
                {showPayment ? (
                  <StripePayment
                    orderData={{
                      email: formData.email,
                      firstName: formData.firstName,
                      lastName: formData.lastName,
                      phone: formData.phone,
                      ...(preferPointRelais && selectedRelayPoint && {
                        mondialRelayPoint: formData.mondialRelayPoint
                      }),
                      deliveryType: (preferPointRelais && availableServices.pointRelais) ? 'point-relais' : 'domicile',
                      deliveryAddress: formData.address,
                      deliveryPostalCode: formData.postalCode,
                      deliveryCity: formData.city,
                      deliveryCountry: selectedCountry || 'FR',
                      items: items.map(item => ({
                        productId: item.product.id,
                        productName: item.product.name,
                        productPrice: item.product.price,
                        quantity: item.quantity
                      })),
                      subtotal,
                      shippingCost,
                      total
                    }}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                ) : (
                  <Button 
                    type="submit" 
                    className="w-full gap-2" 
                    size="lg"
                    disabled={isProcessing || !canProceedToPayment()}
                  >
                    <CreditCard className="h-5 w-5" />
                    {isProcessing ? "Traitement..." : "Procéder au paiement"}
                  </Button>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>Paiement 100% sécurisé</span>
                  </div>
                  {!weightValidation.isValid && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span>{weightValidation.error}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}