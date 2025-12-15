"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, User, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const profileSchema = z.object({
  first_name: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  last_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  account_type: z.enum(["particulier", "professionnel"]).optional(),
  company_name: z.string().optional(),
  address_formatted: z.string().min(5, "L'adresse doit contenir au moins 5 caractères"),
  postcode: z.string().min(5, "Le code postal doit contenir au moins 5 caractères"),
  city: z.string().min(2, "La ville doit contenir au moins 2 caractères"),
  country: z.string().min(2, "Le pays doit contenir au moins 2 caractères"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function MesInfosPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading, error, updateProfile } = useProfile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      account_type: "particulier",
      company_name: "",
      address_formatted: "",
      postcode: "",
      city: "",
      country: "",
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/connexion');
    }
  }, [user, authLoading, router]);

  // Update form when profile loads
  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        account_type: (profile.account_type === "particulier" || profile.account_type === "professionnel") ? profile.account_type : "particulier",
        company_name: profile.company_name || "",
        address_formatted: profile.address_formatted || "",
        postcode: profile.postcode || "",
        city: profile.city || "",
        country: profile.country || "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true);
    
    try {
      const updateData = {
        ...data,
        // Ensure company_name is null for particulier accounts
        company_name: data.account_type === "particulier" ? null : data.company_name,
      };

      const result = await updateProfile(updateData);

      if (result.success) {
        toast({
          title: "Profil mis à jour !",
          description: "Vos informations ont été mises à jour avec succès.",
        });
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Une erreur est survenue lors de la mise à jour.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue est survenue.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state during authentication check
  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (redirect will happen)
  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <User className="h-8 w-8 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Mes informations
            </h1>
            <p className="text-muted-foreground">
              Consultez et modifiez vos informations personnelles
            </p>
          </div>
        </div>
        <Separator />
      </div>

      {/* Error State */}
      {error && (
        <Card className="mb-6 border-destructive/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <span className="font-medium">Erreur :</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && !profile && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement de vos informations...</p>
          </div>
        </div>
      )}

      {/* Profile Form */}
      {profile && (
        <div className="grid gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Vos informations de base et de contact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Jean" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom *</FormLabel>
                          <FormControl>
                            <Input placeholder="Dupont" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="jean.dupont@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="06 12 34 56 78" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Account Type */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Type de compte</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="account_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type de compte</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="particulier">Particulier</SelectItem>
                                <SelectItem value="professionnel">Professionnel</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch("account_type") === "professionnel" && (
                        <FormField
                          control={form.control}
                          name="company_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nom de l'entreprise</FormLabel>
                              <FormControl>
                                <Input placeholder="Mon Entreprise SARL" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Address */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Adresse</h3>
                    
                    <FormField
                      control={form.control}
                      name="address_formatted"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Adresse complète *</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Rue de la Paix" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="postcode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code postal *</FormLabel>
                            <FormControl>
                              <Input placeholder="33000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ville *</FormLabel>
                            <FormControl>
                              <Input placeholder="Bordeaux" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pays *</FormLabel>
                            <FormControl>
                              <Input placeholder="France" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button 
                      type="submit" 
                      className="gap-2"
                      disabled={isSubmitting}
                    >
                      <Save className="h-4 w-4" />
                      {isSubmitting ? "Sauvegarde..." : "Sauvegarder les modifications"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}