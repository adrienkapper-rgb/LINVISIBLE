"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImageIcon, Upload, Loader2, Check, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ImageData {
  name: string;
  url: string;
  createdAt: string;
  size: number;
}

interface ImagePickerDialogProps {
  value?: string;
  onChange: (url: string) => void;
}

export function ImagePickerDialog({ value, onChange }: ImagePickerDialogProps) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<ImageData[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(value || null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [deleteInfo, setDeleteInfo] = useState<{ wasUsed: boolean; usedByCount: number; products: any[] } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Charger les images quand le dialog s'ouvre
  useEffect(() => {
    if (open) {
      loadImages();
    }
  }, [open]);

  // Mettre à jour la sélection quand la valeur change
  useEffect(() => {
    setSelectedUrl(value || null);
  }, [value]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/storage/images');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des images');
      }
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les images",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation côté client
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Format invalide",
        description: "Utilisez uniquement JPG, PNG ou WebP",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/storage/images', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur lors de l\'upload');
      }

      const data = await response.json();

      toast({
        title: "Upload réussi",
        description: "L'image a été ajoutée à la galerie",
      });

      // Recharger les images et sélectionner la nouvelle
      await loadImages();
      setSelectedUrl(data.image.url);
    } catch (error) {
      console.error('Erreur upload:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'uploader l'image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Réinitialiser l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelect = () => {
    if (selectedUrl) {
      onChange(selectedUrl);
      setOpen(false);
      toast({
        title: "Image sélectionnée",
        description: "L'image a été mise à jour",
      });
    }
  };

  const handleDeleteClick = async (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Empêcher la sélection de l'image
    setImageToDelete(imageUrl);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!imageToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/storage/images?url=${encodeURIComponent(imageToDelete)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      const data = await response.json();
      setDeleteInfo(data);

      // Si l'image supprimée était sélectionnée, désélectionner
      if (selectedUrl === imageToDelete) {
        setSelectedUrl(null);
      }

      // Recharger les images
      await loadImages();

      toast({
        title: "Image supprimée",
        description: data.wasUsed
          ? `L'image a été supprimée (utilisée par ${data.usedByCount} produit${data.usedByCount > 1 ? 's' : ''})`
          : "L'image a été supprimée avec succès",
      });
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de supprimer l'image",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setImageToDelete(null);
      setDeleteInfo(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-start">
          <ImageIcon className="mr-2 h-4 w-4" />
          {value ? "Changer l'image" : "Choisir une image"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choisir une image</DialogTitle>
          <DialogDescription>
            Sélectionnez une image existante ou uploadez-en une nouvelle
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bouton Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Uploader une nouvelle image
                </>
              )}
            </Button>
          </div>

          {/* Grille d'images */}
          {loading ? (
            <div className="grid grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="mx-auto h-12 w-12 mb-4" />
              <p>Aucune image disponible</p>
              <p className="text-sm">Uploadez votre première image</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {images.map((image) => (
                <div
                  key={image.url}
                  className="relative group"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedUrl(image.url)}
                    className={`
                      relative aspect-square rounded-lg overflow-hidden border-2 transition-all w-full
                      ${selectedUrl === image.url
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'border-transparent hover:border-muted-foreground/50'
                      }
                    `}
                  >
                    <Image
                      src={image.url}
                      alt={image.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 15vw"
                    />
                    {selectedUrl === image.url && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </button>

                  {/* Bouton de suppression visible au survol */}
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(image.url, e)}
                    className="absolute top-2 left-2 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Supprimer cette image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleSelect}
            disabled={!selectedUrl}
          >
            Sélectionner
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* AlertDialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette image ?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>Cette action est irréversible. L'image sera définitivement supprimée du stockage.</p>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  ⚠️ Si cette image est utilisée par des produits, elle ne sera plus affichée.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                'Supprimer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
