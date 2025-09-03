'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, User, Mail, Phone, MessageSquare, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface MessageDetails {
  id: string
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  status: 'new' | 'read' | 'replied' | 'archived'
  created_at: string
  updated_at: string
}

export default function MessageDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [message, setMessage] = useState<MessageDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchMessage(params.id as string)
    }
  }, [params.id])

  const fetchMessage = async (messageId: string) => {
    try {
      const response = await fetch(`/api/admin/messages/${messageId}`)
      if (!response.ok) throw new Error('Failed to fetch message')
      
      const data = await response.json()
      setMessage(data)
    } catch (error) {
      toast.error('Erreur lors du chargement du message')
    } finally {
      setLoading(false)
    }
  }

  const updateMessageStatus = async (newStatus: string) => {
    if (!message) return

    try {
      setUpdating(true)
      const response = await fetch(`/api/admin/messages/${message.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) throw new Error('Failed to update message')
      
      setMessage(prev => prev ? { ...prev, status: newStatus as any } : null)
      toast.success('Statut du message mis à jour')
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut')
    } finally {
      setUpdating(false)
    }
  }

  const deleteMessage = async () => {
    if (!message) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/admin/messages/${message.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete message')
      
      toast.success('Message supprimé avec succès')
      router.push('/admin/messages')
    } catch (error) {
      toast.error('Erreur lors de la suppression du message')
      setDeleting(false)
    }
  }

  const sendEmailReply = () => {
    if (!message) return
    
    const subject = `Re: ${message.subject}`
    const body = `Bonjour ${message.name},\n\nMerci pour votre message concernant "${message.subject}".\n\n\n\nCordialement,\nL'équipe L'Invisible`
    
    const emailUrl = `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(emailUrl)
    
    // Mark as replied
    updateMessageStatus('replied')
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      new: 'destructive',
      read: 'secondary',
      replied: 'default',
      archived: 'outline'
    }
    
    const labels: Record<string, string> = {
      new: 'Nouveau',
      read: 'Lu',
      replied: 'Répondu',
      archived: 'Archivé'
    }
    
    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (!message) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Message introuvable</h1>
        <Button onClick={() => router.back()}>
          Retour
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{message.subject}</h1>
          <p className="text-muted-foreground">
            Reçu le {new Date(message.created_at).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(message.status)}
          <Select 
            value={message.status} 
            onValueChange={updateMessageStatus} 
            disabled={updating}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Nouveau</SelectItem>
              <SelectItem value="read">Lu</SelectItem>
              <SelectItem value="replied">Répondu</SelectItem>
              <SelectItem value="archived">Archivé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold">{message.name}</h4>
            </div>
            
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a 
                href={`mailto:${message.email}`}
                className="text-blue-600 hover:underline"
              >
                {message.email}
              </a>
            </div>
            
            {message.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={`tel:${message.phone}`}
                  className="text-blue-600 hover:underline"
                >
                  {message.phone}
                </a>
              </div>
            )}
            
            <Separator />
            
            <div className="space-y-2">
              <Button 
                onClick={sendEmailReply}
                className="w-full"
                size="sm"
              >
                <Mail className="h-4 w-4 mr-2" />
                Répondre par email
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    size="sm"
                    disabled={deleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer ce message ? 
                      Cette action est irréversible.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={deleteMessage}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* Message Content */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Message
            </CardTitle>
            <CardDescription>
              Sujet: {message.subject}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-sans">
                {message.message}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Message Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Historique</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="font-medium">Message reçu</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(message.created_at).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            
            {message.status !== 'new' && (
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium">Statut mis à jour</p>
                  <p className="text-sm text-muted-foreground">
                    Marqué comme "{getStatusBadge(message.status).props.children}"
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(message.updated_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}