"use client";

import Link from "next/link";
import { ShoppingCart, User, LogOut, Package, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/store";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useAdmin } from "@/hooks/use-admin";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const items = useCart((state) => state.items);
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const { user, signOut } = useAuth();
  const { displayName } = useProfile();
  const { isAdmin } = useAdmin();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-serif">L'invisible</span>
        </Link>
        
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Accueil
          </Link>
          <Link href="/boutique" className="text-sm font-medium transition-colors hover:text-primary">
            Boutique
          </Link>
          <Link href="/contact" className="text-sm font-medium transition-colors hover:text-primary">
            Contact
          </Link>
        </nav>
        
        <div className="flex gap-2 items-center">
          {/* Menu hamburger mobile */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="text-left">L'invisible</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Link
                    href="/"
                    className="block px-2 py-1 text-sm transition-colors hover:text-primary rounded-md hover:bg-accent"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Accueil
                  </Link>
                  <Link
                    href="/boutique"
                    className="block px-2 py-1 text-sm transition-colors hover:text-primary rounded-md hover:bg-accent"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Boutique
                  </Link>
                  <Link
                    href="/contact"
                    className="block px-2 py-1 text-sm transition-colors hover:text-primary rounded-md hover:bg-accent"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Contact
                  </Link>
                </div>

                {user && (
                  <>
                    <div className="border-t border-border"></div>
                    <div className="grid gap-2">
                      <div className="text-xs text-muted-foreground px-2">
                        {user.email}
                      </div>
                      <Link
                        href="/mes-infos"
                        className="flex items-center px-2 py-1 text-sm transition-colors hover:text-primary rounded-md hover:bg-accent"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Mes infos
                      </Link>
                      <Link
                        href="/mes-commandes"
                        className="flex items-center px-2 py-1 text-sm transition-colors hover:text-primary rounded-md hover:bg-accent"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        Mes commandes
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center px-2 py-1 text-sm transition-colors hover:text-primary rounded-md hover:bg-accent"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Administration
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center px-2 py-1 text-sm transition-colors hover:text-primary rounded-md hover:bg-accent text-left"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Se déconnecter
                      </button>
                    </div>
                  </>
                )}

                {!user && (
                  <>
                    <div className="border-t border-border"></div>
                    <div className="grid gap-2">
                      <Link
                        href="/connexion"
                        className="flex items-center px-2 py-1 text-sm transition-colors hover:text-primary rounded-md hover:bg-accent"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Se connecter
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden md:inline">
                Bonjour {displayName}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                  <DropdownMenuItem disabled>
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/mes-infos">
                      <User className="mr-2 h-4 w-4" />
                      Mes infos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/mes-commandes">
                      <Package className="mr-2 h-4 w-4" />
                      Mes commandes
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          Administration
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link href="/connexion">
              <Button variant="outline" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Link href="/panier">
            <Button variant="outline" size="icon" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}