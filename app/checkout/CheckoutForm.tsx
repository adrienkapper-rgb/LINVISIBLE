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
import { useCartWithProducts } from "@/lib/hooks/useCartWithProducts";
import { StripePayment } from "@/components/StripePayment";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Package, CreditCard, AlertCircle, Globe, Edit2, Save, Gift, Tag, Loader2, Check, X } from "lucide-react";
import { saveUserInfo } from "@/app/actions/user";
import { MondialRelayWidget } from "@/components/MondialRelayWidget";
import { calculateTotalWeight, getShippingInfo, validatePackageWeight, SUPPORTED_COUNTRIES, getAvailableServices } from "@/lib/shipping/mondial-relay-pricing";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CheckoutFormProps {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    countryCode?: string;
  };
}

export function CheckoutForm({ user }: CheckoutFormProps) {
  const router = useRouter();
  const { clearCart } = useCart();
  const { items, getTotalPrice, isLoading, error } = useCartWithProducts();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
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
  
  // États pour la fonctionnalité destinataire
  const [isGift, setIsGift] = useState(false);
  const [recipientData, setRecipientData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "FR",
  });

  // États pour le code promo
  const [discountCodeInput, setDiscountCodeInput] = useState("");
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);

  // Mettre à jour automatiquement les champs avec les données utilisateur
  useEffect(() => {
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
  }, [user]);

  // Obtenir le pays effectif (utilisateur ou destinataire)
  const effectiveCountry = isGift ? recipientData.country : selectedCountry;
  
  // Obtenir les services disponibles pour le pays sélectionné
  const availableServices = getAvailableServices(effectiveCountry);

  // Calcul dynamique du poids et du tarif
  const totalWeight = calculateTotalWeight(items);

  // Vérifier si le poids dépasse la limite pour la livraison à domicile (25kg pour la France)
  const DOMICILE_WEIGHT_LIMIT = 25000; // 25kg en grammes
  const isOverDomicileLimit = totalWeight > DOMICILE_WEIGHT_LIMIT && effectiveCountry === 'FR';

  // Si le poids dépasse la limite domicile et que domicile était sélectionné, forcer Point Relais
  useEffect(() => {
    if (isOverDomicileLimit && !preferPointRelais && availableServices.pointRelais) {
      setPreferPointRelais(true);
      setSelectedRelayPoint(null);
    }
  }, [isOverDomicileLimit, preferPointRelais, availableServices.pointRelais]);

  const shippingInfo = getShippingInfo(totalWeight, effectiveCountry, preferPointRelais && availableServices.pointRelais);
  const shippingCost = shippingInfo.cost;
  const subtotal = getTotalPrice();
  const total = Math.max(0, subtotal + shippingCost - discountAmount); // Ne pas aller en négatif

  // Fonction pour appliquer un code promo
  const handleApplyDiscount = async () => {
    if (!discountCodeInput.trim()) {
      setDiscountError("Veuillez entrer un code");
      return;
    }

    setDiscountLoading(true);
    setDiscountError(null);

    try {
      const response = await fetch("/api/validate-discount-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCodeInput.trim() }),
      });

      const data = await response.json();

      if (data.valid) {
        setDiscountCode(data.code);
        setDiscountAmount(data.amount);
        setDiscountError(null);
        toast({
          title: "Code promo appliqué",
          description: `Réduction de ${data.amount.toFixed(2)}€`,
        });
      } else {
        setDiscountError(data.error || "Code invalide");
        setDiscountCode(null);
        setDiscountAmount(0);
      }
    } catch (error) {
      setDiscountError("Erreur lors de la validation");
      setDiscountCode(null);
      setDiscountAmount(0);
    } finally {
      setDiscountLoading(false);
    }
  };

  // Fonction pour retirer le code promo
  const handleRemoveDiscount = () => {
    setDiscountCode(null);
    setDiscountAmount(0);
    setDiscountCodeInput("");
    setDiscountError(null);
  };
  
  // Validation du poids pour le pays sélectionné
  const weightValidation = validatePackageWeight(totalWeight, effectiveCountry);

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

    // Vérifier que toutes les informations de livraison sont remplies
    const deliveryData = isGift ? recipientData : formData;
    if (!deliveryData.address.trim() || !deliveryData.postalCode.trim() || !deliveryData.city.trim()) {
      toast({
        title: "Erreur",
        description: `Veuillez renseigner une adresse complète pour ${isGift ? 'le destinataire' : 'vos informations de contact'}`,
        variant: "destructive",
      });
      return;
    }

    // Vérifier les autres champs requis pour les cadeaux
    if (isGift) {
      if (!recipientData.firstName.trim() || !recipientData.lastName.trim() || !recipientData.phone.trim()) {
        toast({
          title: "Erreur",
          description: "Veuillez renseigner toutes les informations du destinataire",
          variant: "destructive",
        });
        return;
      }
    }

    // Sauvegarder les infos utilisateur
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

    setShowPayment(true);
  };

  const handlePaymentSuccess = (orderNumber: string) => {
    clearCart();
    // Si c'est un PaymentIntent ID (commence par "pi_"), utiliser le paramètre payment_intent
    if (orderNumber.startsWith('pi_')) {
      router.push(`/confirmation?payment_intent=${orderNumber}`);
    } else {
      router.push(`/confirmation?order=${orderNumber}`);
    }
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

  const handleRecipientInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientData({
      ...recipientData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveInfo = async () => {
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

  // Formater l'adresse complète du point relais
  const formatRelayPointAddress = (point: any): string => {
    let address = point.LgAdr1; // Nom du commerce
    
    if (point.LgAdr3) {
      address += `\n${point.LgAdr3}`; // Adresse rue sur nouvelle ligne
    }
    
    if (point.LgAdr2) {
      address += `\n${point.LgAdr2}`; // Info supplémentaire sur nouvelle ligne
    }
    
    address += `\n${point.CP} ${point.Ville}`; // Code postal + ville sur nouvelle ligne
    
    return address;
  };

  const handleRelayPointSelection = (point: any) => {
    setSelectedRelayPoint(point);
    setFormData({
      ...formData,
      mondialRelayPoint: formatRelayPointAddress(point),
    });
  };

  // Déterminer si on peut procéder au paiement selon le mode de livraison
  const canProceedToPayment = () => {
    const deliveryData = isGift ? recipientData : formData;
    
    if (preferPointRelais && availableServices.pointRelais) {
      // Mode Point Relais : un point doit être sélectionné
      return selectedRelayPoint !== null;
    } else {
      // Mode Livraison à domicile : adresse complète requise
      const hasCompleteAddress = deliveryData.address.trim() !== '' && 
                                 deliveryData.postalCode.trim() !== '' && 
                                 deliveryData.city.trim() !== '';
      
      // Pour les cadeaux, vérifier aussi les autres champs
      if (isGift) {
        return hasCompleteAddress && 
               recipientData.firstName.trim() !== '' && 
               recipientData.lastName.trim() !== '' && 
               recipientData.phone.trim() !== '';
      }
      
      return hasCompleteAddress;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container px-4 py-16 text-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container px-4 py-16 text-center">
        <div className="bg-destructive/10 text-destructive rounded-lg p-6 mb-6 max-w-2xl mx-auto">
          <p className="font-medium">Erreur lors du chargement du panier</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
        <Link href="/">
          <Button>Retour à la boutique</Button>
        </Link>
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="container px-4 py-16 text-center">
        <p>Votre panier est vide.</p>
        <Link href="/">
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
            {/* Recipient Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Destinataire
                  </div>
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
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sélection du destinataire */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Pour qui est cette commande ?</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="for-me"
                        name="recipient-type"
                        checked={!isGift}
                        onChange={() => {
                          setIsGift(false);
                          setSelectedCountry((user?.countryCode || 'FR').toUpperCase());
                          setSelectedRelayPoint(null);
                        }}
                      />
                      <Label htmlFor="for-me" className="text-sm">
                        Pour moi-même
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="for-someone-else"
                        name="recipient-type"
                        checked={isGift}
                        onChange={() => {
                          setIsGift(true);
                          setSelectedCountry(recipientData.country);
                          setSelectedRelayPoint(null);
                        }}
                      />
                      <Label htmlFor="for-someone-else" className="text-sm flex items-center gap-1">
                        <Gift className="h-4 w-4" />
                        Pour quelqu'un d'autre (cadeau)
                      </Label>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Formulaire pour "Pour moi-même" */}
                {!isGift && (
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
                        disabled={true}
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
                          disabled={!isEditingInfo}
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
                          disabled={!isEditingInfo}
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
                        disabled={!isEditingInfo}
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
                        disabled={!isEditingInfo}
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
                          disabled={!isEditingInfo}
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
                          disabled={!isEditingInfo}
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
                        disabled={!isEditingInfo}
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
                )}

                {/* Formulaire pour "Pour quelqu'un d'autre" */}
                {isGift && (
                  <div className="grid gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700 font-medium">
                        Informations du destinataire du cadeau
                      </p>
                    </div>

                    {/* Prénom et Nom du destinataire */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="recipientFirstName">Prénom du destinataire *</Label>
                        <Input
                          id="recipientFirstName"
                          name="firstName"
                          value={recipientData.firstName}
                          onChange={handleRecipientInputChange}
                          placeholder="Prénom du destinataire"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="recipientLastName">Nom du destinataire *</Label>
                        <Input
                          id="recipientLastName"
                          name="lastName"
                          value={recipientData.lastName}
                          onChange={handleRecipientInputChange}
                          placeholder="Nom du destinataire"
                          required
                        />
                      </div>
                    </div>

                    {/* Téléphone du destinataire */}
                    <div>
                      <Label htmlFor="recipientPhone">Téléphone du destinataire *</Label>
                      <Input
                        id="recipientPhone"
                        name="phone"
                        type="tel"
                        value={recipientData.phone}
                        onChange={handleRecipientInputChange}
                        placeholder="Numéro de téléphone du destinataire"
                        required
                      />
                    </div>

                    {/* Adresse du destinataire */}
                    <div>
                      <Label htmlFor="recipientAddress">Adresse du destinataire *</Label>
                      <Input
                        id="recipientAddress"
                        name="address"
                        value={recipientData.address}
                        onChange={handleRecipientInputChange}
                        placeholder="Numéro et nom de rue"
                        required
                      />
                    </div>

                    {/* Code postal et Ville du destinataire */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="recipientPostalCode">Code postal *</Label>
                        <Input
                          id="recipientPostalCode"
                          name="postalCode"
                          value={recipientData.postalCode}
                          onChange={handleRecipientInputChange}
                          placeholder="Code postal"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="recipientCity">Ville *</Label>
                        <Input
                          id="recipientCity"
                          name="city"
                          value={recipientData.city}
                          onChange={handleRecipientInputChange}
                          placeholder="Ville"
                          required
                        />
                      </div>
                    </div>

                    {/* Pays du destinataire */}
                    <div>
                      <Label htmlFor="recipientCountry">Pays *</Label>
                      <Select 
                        value={recipientData.country} 
                        onValueChange={(value) => {
                          setRecipientData({
                            ...recipientData,
                            country: value
                          });
                          setSelectedCountry(value);
                        }}
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
                )}
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
                          disabled={isOverDomicileLimit}
                        />
                        <Label htmlFor="home-delivery" className={`text-sm ${isOverDomicileLimit ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          Livraison à domicile {isOverDomicileLimit && '(non disponible pour ce poids)'}
                        </Label>
                      </div>
                      {isOverDomicileLimit && (
                        <div className="p-3 bg-orange-50 rounded-lg flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-orange-700">
                            La livraison à domicile est limitée à 25kg (environ 21 bouteilles). Votre commande de {(totalWeight / 1000).toFixed(1)}kg nécessite la livraison en Point Relais.
                          </p>
                        </div>
                      )}
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
                    autoOpen={true}
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

                {/* Code promo */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Code promo
                  </Label>
                  {discountCode ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <Check className="h-4 w-4" />
                        <span className="text-sm font-medium">{discountCode}</span>
                        <span className="text-sm">(-{discountAmount.toFixed(2)}€)</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveDiscount}
                        className="h-6 w-6 p-0 text-green-700 hover:text-red-600"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Entrez votre code"
                        value={discountCodeInput}
                        onChange={(e) => {
                          setDiscountCodeInput(e.target.value.toUpperCase());
                          setDiscountError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyDiscount();
                          }
                        }}
                        className="flex-1"
                        disabled={discountLoading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleApplyDiscount}
                        disabled={discountLoading || !discountCodeInput.trim()}
                      >
                        {discountLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Appliquer"
                        )}
                      </Button>
                    </div>
                  )}
                  {discountError && (
                    <p className="text-sm text-red-500">{discountError}</p>
                  )}
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
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Réduction ({discountCode})</span>
                      <span>-{discountAmount.toFixed(2)}€</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total TTC</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
                
                {showPayment ? (
                  <StripePayment
                    orderData={{
                      // Informations de facturation (toujours l'utilisateur connecté)
                      email: formData.email,
                      firstName: formData.firstName,
                      lastName: formData.lastName,
                      phone: formData.phone,
                      // Informations de livraison (utilisateur ou destinataire)
                      ...(preferPointRelais && selectedRelayPoint && {
                        mondialRelayPoint: formData.mondialRelayPoint
                      }),
                      deliveryType: (preferPointRelais && availableServices.pointRelais) ? 'point-relais' : 'domicile',
                      deliveryAddress: isGift ? recipientData.address : formData.address,
                      deliveryPostalCode: isGift ? recipientData.postalCode : formData.postalCode,
                      deliveryCity: isGift ? recipientData.city : formData.city,
                      deliveryCountry: isGift ? recipientData.country : selectedCountry || 'FR',
                      items: items.map(item => ({
                        productId: item.product.id,
                        productName: item.product.name,
                        productPrice: item.product.price,
                        quantity: item.quantity
                      })),
                      subtotal,
                      shippingCost,
                      total,
                      // Informations cadeau
                      isGift,
                      recipientFirstName: isGift ? recipientData.firstName : undefined,
                      recipientLastName: isGift ? recipientData.lastName : undefined,
                      // Code promo
                      discountCode: discountCode || undefined,
                      discountAmount: discountAmount || undefined
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