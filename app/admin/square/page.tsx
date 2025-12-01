'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Store, Link2, Unlink, RefreshCw, AlertTriangle, CheckCircle, Clock, Settings, Download, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Product {
  id: string
  name: string
  slug: string
  stock_quantity: number
}

interface SquareMapping {
  id: string
  product_id: string
  square_item_id: string
  square_item_name: string | null
  sync_enabled: boolean // Toujours true (pas de colonne dans DB)
  created_at: string
  product?: Product
}

interface SquareTransaction {
  id: string
  square_transaction_id: string
  square_order_id: string | null
  product_id: string | null
  quantity: number
  total_amount: number // amount_cents from DB
  transaction_date: string
  location_name: string | null
  synced: boolean // processed from DB
  created_at: string
  product?: Product
}

interface GroupedTransaction {
  square_transaction_id: string
  transaction_date: string
  total_amount: number
  total_quantity: number
  all_synced: boolean
  items: SquareTransaction[]
}

export default function SquarePage() {
  const [mappings, setMappings] = useState<SquareMapping[]>([])
  const [transactions, setTransactions] = useState<SquareTransaction[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [productFilter, setProductFilter] = useState<string>('all')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const itemsPerPage = 20

  // Dialog state
  const [showMappingDialog, setShowMappingDialog] = useState(false)
  const [editingMapping, setEditingMapping] = useState<SquareMapping | null>(null)
  const [mappingForm, setMappingForm] = useState({
    product_id: '',
    square_item_id: '',
    square_item_name: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setCurrentPage(1)
      const [mappingsRes, transactionsRes, productsRes] = await Promise.all([
        fetch('/api/admin/square/mappings'),
        fetch('/api/admin/square/transactions'),
        fetch('/api/admin/products')
      ])

      if (mappingsRes.ok) {
        const data = await mappingsRes.json()
        setMappings(data)
      }

      if (transactionsRes.ok) {
        const data = await transactionsRes.json()
        setTransactions(data)
      }

      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(data)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMapping = async () => {
    try {
      const url = editingMapping
        ? `/api/admin/square/mappings/${editingMapping.id}`
        : '/api/admin/square/mappings'

      const method = editingMapping ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mappingForm)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur')
      }

      toast.success(editingMapping ? 'Mapping mis à jour' : 'Mapping créé')
      setShowMappingDialog(false)
      setEditingMapping(null)
      setMappingForm({ product_id: '', square_item_id: '', square_item_name: '' })
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleDeleteMapping = async (mappingId: string) => {
    if (!confirm('Supprimer ce mapping ?')) return

    try {
      const response = await fetch(`/api/admin/square/mappings/${mappingId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Erreur')

      toast.success('Mapping supprimé')
      fetchData()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }


  const handleReconcile = async () => {
    try {
      setSyncing(true)
      const response = await fetch('/api/admin/square/reconcile', {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erreur')
      }

      const result = await response.json()
      toast.success(`Réconciliation terminée: ${result.synced_count} transactions traitées`)
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSyncing(false)
    }
  }

  const handleImport = async (days: number = 7) => {
    try {
      setImporting(true)

      // Récupérer le token d'auth pour l'Edge Function
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error('Non authentifié')
      }

      const response = await fetch(
        `https://rnxhkjvcixumuvjfxdjo.supabase.co/functions/v1/square-import?days=${days}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || error.details || 'Erreur import')
      }

      const result = await response.json()
      toast.success(
        `Import terminé: ${result.imported} transactions importées, ${result.skipped} ignorées`
      )
      fetchData()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setImporting(false)
    }
  }

  const openEditMapping = (mapping: SquareMapping) => {
    setEditingMapping(mapping)
    setMappingForm({
      product_id: mapping.product_id,
      square_item_id: mapping.square_item_id || '',
      square_item_name: mapping.square_item_name || ''
    })
    setShowMappingDialog(true)
  }

  const openNewMapping = () => {
    setEditingMapping(null)
    setMappingForm({ product_id: '', square_item_id: '', square_item_name: '' })
    setShowMappingDialog(true)
  }

  // Produits non mappés
  const unmappedProducts = products.filter(
    p => !mappings.some(m => m.product_id === p.id)
  )

  // Transactions non synchronisées
  const unsyncedTransactions = transactions.filter(t => !t.synced)

  // Filtrer les transactions par produit
  const filteredTransactions = productFilter === 'all'
    ? transactions
    : productFilter === 'unmapped'
      ? transactions.filter(t => !t.product_id)
      : transactions.filter(t => t.product_id === productFilter)

  // Pagination (sur les transactions filtrées)
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset pagination when filter changes
  const handleProductFilterChange = (value: string) => {
    setProductFilter(value)
    setCurrentPage(1)
  }

  // Grouper les transactions par square_transaction_id
  const groupedTransactions: GroupedTransaction[] = (() => {
    const groups = new Map<string, SquareTransaction[]>()

    for (const t of filteredTransactions) {
      const existing = groups.get(t.square_transaction_id)
      if (existing) {
        existing.push(t)
      } else {
        groups.set(t.square_transaction_id, [t])
      }
    }

    return Array.from(groups.entries()).map(([id, items]) => ({
      square_transaction_id: id,
      transaction_date: items[0].transaction_date,
      total_amount: items.reduce((sum, item) => sum + item.total_amount, 0),
      total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      all_synced: items.every(item => item.synced),
      items: items.sort((a, b) => (a.product?.name || '').localeCompare(b.product?.name || ''))
    })).sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
  })()

  // Pagination sur les groupes
  const totalGroupPages = Math.ceil(groupedTransactions.length / itemsPerPage)
  const paginatedGroups = groupedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Toggle expand/collapse group
  const toggleGroup = (transactionId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev)
      if (next.has(transactionId)) {
        next.delete(transactionId)
      } else {
        next.add(transactionId)
      }
      return next
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Intégration Square POS</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Intégration Square POS</h1>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button
            onClick={() => handleImport(7)}
            disabled={importing}
            variant="outline"
          >
            <Download className={`h-4 w-4 mr-2 ${importing ? 'animate-pulse' : ''}`} />
            {importing ? 'Import...' : 'Import 7j'}
          </Button>
          <Button
            onClick={handleReconcile}
            disabled={syncing || unsyncedTransactions.length === 0}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Réconciliation...' : 'Réconcilier'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produits mappés</CardTitle>
            <Link2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mappings.length}</div>
            <p className="text-xs text-muted-foreground">
              sur {products.length} produits
            </p>
          </CardContent>
        </Card>

        <Card className={unmappedProducts.length > 0 ? 'border-orange-200 bg-orange-50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${unmappedProducts.length > 0 ? 'text-orange-700' : ''}`}>
              Non mappés
            </CardTitle>
            <Unlink className={`h-4 w-4 ${unmappedProducts.length > 0 ? 'text-orange-600' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${unmappedProducts.length > 0 ? 'text-orange-600' : ''}`}>
              {unmappedProducts.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions Square</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactions.length}</div>
            <p className="text-xs text-muted-foreground">
              7 derniers jours
            </p>
          </CardContent>
        </Card>

        <Card className={unsyncedTransactions.length > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${unsyncedTransactions.length > 0 ? 'text-red-700' : ''}`}>
              À synchroniser
            </CardTitle>
            <Clock className={`h-4 w-4 ${unsyncedTransactions.length > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${unsyncedTransactions.length > 0 ? 'text-red-600' : ''}`}>
              {unsyncedTransactions.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mappings Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Mapping Produits Square
              </CardTitle>
              <CardDescription>
                Associez vos produits aux articles Square POS
              </CardDescription>
            </div>
            <Dialog open={showMappingDialog} onOpenChange={setShowMappingDialog}>
              <DialogTrigger asChild>
                <Button onClick={openNewMapping}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Nouveau mapping
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingMapping ? 'Modifier le mapping' : 'Nouveau mapping'}
                  </DialogTitle>
                  <DialogDescription>
                    Associez un produit L'Invisible à un article Square
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Produit L'Invisible</Label>
                    <Select
                      value={mappingForm.product_id}
                      onValueChange={(value) => setMappingForm(f => ({ ...f, product_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un produit" />
                      </SelectTrigger>
                      <SelectContent>
                        {(editingMapping ? products : unmappedProducts).map(product => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ID Catalog Square *</Label>
                    <Input
                      value={mappingForm.square_item_id}
                      onChange={(e) => setMappingForm(f => ({ ...f, square_item_id: e.target.value }))}
                      placeholder="Ex: XXXXXXXXXXXXXXXXXX"
                    />
                    <p className="text-xs text-muted-foreground">
                      Trouvez cet ID dans Square Dashboard &gt; Items &gt; Cliquez sur l'article
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Nom dans Square (optionnel)</Label>
                    <Input
                      value={mappingForm.square_item_name}
                      onChange={(e) => setMappingForm(f => ({ ...f, square_item_name: e.target.value }))}
                      placeholder="Pour référence uniquement"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowMappingDialog(false)}>
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSaveMapping}
                    disabled={!mappingForm.product_id || !mappingForm.square_item_id}
                  >
                    {editingMapping ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit L'Invisible</TableHead>
                <TableHead>ID Square (Catalog)</TableHead>
                <TableHead>Nom Square</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mappings.map((mapping) => (
                <TableRow key={mapping.id}>
                  <TableCell className="font-medium">
                    {mapping.product?.name || 'Produit supprimé'}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {mapping.square_item_id && mapping.square_item_id.length > 12
                      ? `${mapping.square_item_id.substring(0, 12)}...`
                      : mapping.square_item_id || '-'}
                  </TableCell>
                  <TableCell>{mapping.square_item_name || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditMapping(mapping)}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteMapping(mapping.id)}
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {mappings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Aucun mapping configuré
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Transactions - Grouped by Transaction ID */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Transactions Square récentes
                <Badge variant="secondary" className="ml-2">
                  {groupedTransactions.length} notes ({filteredTransactions.length} lignes)
                </Badge>
              </CardTitle>
              <CardDescription>
                Ventes enregistrées depuis Square POS - groupées par note (7 derniers jours)
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="product-filter" className="text-sm whitespace-nowrap">Filtrer par produit :</Label>
              <Select value={productFilter} onValueChange={handleProductFilterChange}>
                <SelectTrigger id="product-filter" className="w-[200px]">
                  <SelectValue placeholder="Tous les produits" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les produits</SelectItem>
                  <SelectItem value="unmapped">Non mappés</SelectItem>
                  {products.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Date</TableHead>
                <TableHead>ID Transaction</TableHead>
                <TableHead>Produits</TableHead>
                <TableHead className="text-center">Qté totale</TableHead>
                <TableHead className="text-right">Montant total</TableHead>
                <TableHead className="text-center">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedGroups.map((group) => {
                const isExpanded = expandedGroups.has(group.square_transaction_id)
                const hasMultipleItems = group.items.length > 1

                return (
                  <React.Fragment key={group.square_transaction_id}>
                    {/* Ligne principale du groupe */}
                    <TableRow
                      className={hasMultipleItems ? 'cursor-pointer hover:bg-muted/50' : ''}
                      onClick={() => hasMultipleItems && toggleGroup(group.square_transaction_id)}
                    >
                      <TableCell className="w-10">
                        {hasMultipleItems && (
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {format(new Date(group.transaction_date), 'dd/MM HH:mm', { locale: fr })}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {group.square_transaction_id.substring(0, 12)}...
                      </TableCell>
                      <TableCell>
                        {group.items.length === 1 ? (
                          group.items[0].product?.name || (
                            <span className="text-orange-600 flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              Non mappé
                            </span>
                          )
                        ) : (
                          <span className="text-muted-foreground">
                            {group.items.length} articles
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-bold">
                        {group.total_quantity}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {(group.total_amount / 100).toFixed(2)} €
                      </TableCell>
                      <TableCell className="text-center">
                        {group.all_synced ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Sync
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            <Clock className="h-3 w-3 mr-1" />
                            Partiel
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Détails des items (si expanded et plusieurs items) */}
                    {isExpanded && hasMultipleItems && group.items.map((item) => (
                      <TableRow key={item.id} className="bg-muted/30">
                        <TableCell></TableCell>
                        <TableCell className="text-muted-foreground text-sm">↳</TableCell>
                        <TableCell></TableCell>
                        <TableCell>
                          {item.product?.name || (
                            <span className="text-orange-600 flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              Non mappé
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {(item.total_amount / 100).toFixed(2)} €
                        </TableCell>
                        <TableCell className="text-center">
                          {item.synced ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <Clock className="h-4 w-4 text-orange-600 mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                )
              })}
              {groupedTransactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {productFilter !== 'all'
                      ? 'Aucune transaction pour ce produit'
                      : 'Aucune transaction Square récente'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalGroupPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalGroupPages} ({groupedTransactions.length} notes{productFilter !== 'all' ? ' filtrées' : ''})
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalGroupPages, p + 1))}
                  disabled={currentPage === totalGroupPages}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuration Webhook
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <p className="mb-2">
            Pour recevoir automatiquement les ventes Square, configurez un webhook dans votre Dashboard Square :
          </p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Allez dans Square Dashboard &gt; Developer &gt; Webhooks</li>
            <li>Créez un nouveau webhook avec l'URL :</li>
          </ol>
          <code className="block bg-blue-100 p-2 rounded mt-2 text-sm font-mono">
            https://rnxhkjvcixumuvjfxdjo.supabase.co/functions/v1/square-webhook
          </code>
          <p className="mt-2 text-sm">
            Événements à sélectionner : <code>payment.completed</code>
          </p>
          <p className="mt-2 text-xs text-blue-600">
            Cette URL Supabase Edge Function fonctionne en local et en production.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
