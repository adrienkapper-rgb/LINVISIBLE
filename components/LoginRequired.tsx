"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, User, Shield, Clock } from "lucide-react";

export function LoginRequired() {
  return (
    <div className="container px-4 py-16">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground" />
          <h1 className="text-3xl font-serif">Connexion requise</h1>
          <p className="text-lg text-muted-foreground">
            Pour finaliser votre commande, vous devez être connecté à votre compte.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-center">
              <Shield className="h-5 w-5" />
              Pourquoi se connecter ?
            </CardTitle>
            <CardDescription>
              Un compte vous permet de profiter pleinement de votre expérience d'achat
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="text-center space-y-2">
                <Clock className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">Suivi des commandes</h3>
                <p className="text-muted-foreground">
                  Consultez l'état de vos commandes en temps réel
                </p>
              </div>
              <div className="text-center space-y-2">
                <User className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">Informations sauvegardées</h3>
                <p className="text-muted-foreground">
                  Vos coordonnées sont pré-remplies pour vos prochains achats
                </p>
              </div>
              <div className="text-center space-y-2">
                <Shield className="h-8 w-8 mx-auto text-primary" />
                <h3 className="font-medium">Sécurité</h3>
                <p className="text-muted-foreground">
                  Vos données personnelles et de paiement sont protégées
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/connexion?redirect=checkout">
              <Button size="lg" className="w-full sm:w-auto">
                Se connecter
              </Button>
            </Link>
            <Link href="/connexion?redirect=checkout">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Créer un compte
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Rassurez-vous, votre panier sera conservé pendant votre connexion
          </p>
        </div>

        <div className="pt-8">
          <Link href="/">
            <Button variant="ghost">
              ← Continuer mes achats
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}