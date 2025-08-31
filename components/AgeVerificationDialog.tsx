"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface AgeVerificationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onDeny: () => void;
}

export function AgeVerificationDialog({ isOpen, onConfirm, onDeny }: AgeVerificationDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-2xl font-serif">
            Vérification d'âge requise
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Pour accéder à notre site de vente d'alcool, vous devez confirmer que vous avez plus de 18 ans.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            La vente d'alcool est interdite aux mineurs. L'abus d'alcool est dangereux pour la santé. 
            À consommer avec modération.
          </p>
        </div>
        
        <DialogFooter className="flex gap-2 sm:justify-center">
          <Button 
            variant="outline" 
            onClick={onDeny}
            className="flex-1"
          >
            J'ai moins de 18 ans
          </Button>
          <Button 
            onClick={onConfirm}
            className="flex-1"
          >
            J'ai plus de 18 ans
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}