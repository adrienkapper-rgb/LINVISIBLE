"use client";

import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess: (orderNumber: string) => void;
  onError: (error: string) => void;
  total: number;
  orderNumber: string;
}

function CheckoutForm({ clientSecret, onSuccess, onError, total, orderNumber }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        return_url: `${window.location.origin}/confirmation`,
      },
    });

    if (error) {
      onError(error.message || 'Une erreur est survenue lors du paiement');
      toast({
        title: "Erreur de paiement",
        description: error.message,
        variant: "destructive",
      });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(orderNumber);
      toast({
        title: "Paiement réussi !",
        description: "Votre commande a été confirmée",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg">
        <PaymentElement 
          options={{
            layout: "tabs"
          }}
        />
      </div>
      
      <Button 
        onClick={handleSubmit}
        disabled={!stripe || !elements || isLoading}
        className="w-full gap-2"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Traitement...
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            Payer {total.toFixed(2)}€
          </>
        )}
      </Button>
    </div>
  );
}

interface StripePaymentProps {
  orderData: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    mondialRelayPoint: string;
    items: any[];
    subtotal: number;
    shippingCost: number;
    total: number;
  };
  onSuccess: (orderNumber: string) => void;
  onError: (error: string) => void;
}

export function StripePayment({ orderData, onSuccess, onError }: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [orderNumber, setOrderNumber] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const hasCreatedIntent = useRef(false);
  const idempotencyKey = useRef(`${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const createPaymentIntent = async () => {
    // Protection contre les doubles appels
    if (hasCreatedIntent.current || isCreating) {
      return;
    }
    
    hasCreatedIntent.current = true;
    setIsCreating(true);
    
    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...orderData,
          idempotencyKey: idempotencyKey.current
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        onError(data.error);
        hasCreatedIntent.current = false; // Permettre une nouvelle tentative en cas d'erreur
        return;
      }

      setClientSecret(data.clientSecret);
      setOrderNumber(data.orderNumber);
    } catch (error) {
      onError('Erreur lors de la préparation du paiement');
      hasCreatedIntent.current = false; // Permettre une nouvelle tentative en cas d'erreur
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    // Ne créer le payment intent qu'une seule fois
    if (!hasCreatedIntent.current) {
      createPaymentIntent();
    }
  }, []);

  if (isCreating) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Préparation du paiement...
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <Button onClick={createPaymentIntent} className="w-full">
        Réessayer
      </Button>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#000000',
      },
    },
  };

  return (
    <Elements options={options} stripe={stripePromise}>
      <CheckoutForm
        clientSecret={clientSecret}
        onSuccess={onSuccess}
        onError={onError}
        total={orderData.total}
        orderNumber={orderNumber}
      />
    </Elements>
  );
}