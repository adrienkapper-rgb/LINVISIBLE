'use client'

import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Truck, CreditCard, Phone, Mail } from "lucide-react"
import { UserOrder, getOrderStatusInfo } from "@/hooks/use-user-orders"

interface OrderDetailsProps {
  order: UserOrder
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const statusInfo = getOrderStatusInfo(order.status)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price)
  }

  const getDeliveryInfo = () => {
    if (order.delivery_type === 'point-relais' && order.mondial_relay_point) {
      return {
        type: 'Point Relais',
        address: order.mondial_relay_point,
        icon: <MapPin className="h-4 w-4" />
      }
    } else if (order.delivery_type === 'domicile') {
      return {
        type: 'Livraison à domicile',
        address: `${order.delivery_address}, ${order.delivery_postal_code} ${order.delivery_city}`,
        icon: <Truck className="h-4 w-4" />
      }
    }
    return null
  }

  const deliveryInfo = getDeliveryInfo()

  return (
    <div className="space-y-6">
      {/* Statut de la commande */}
      <div className="flex items-center gap-2">
        <Badge className={statusInfo.color}>
          {statusInfo.label}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {statusInfo.description}
        </span>
      </div>

      {/* Produits commandés */}
      <div>
        <h4 className="font-semibold mb-3">Produits commandés</h4>
        <div className="space-y-2">
          {order.order_items.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-l-4 border-primary/20 pl-3 bg-muted/20 rounded-r">
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-sm text-muted-foreground">
                  Quantité : {item.quantity} × {formatPrice(item.product_price)}
                </p>
              </div>
              <p className="font-semibold">{formatPrice(item.total)}</p>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Informations de livraison */}
      {deliveryInfo && (
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            {deliveryInfo.icon}
            Informations de livraison
          </h4>
          <div className="bg-muted/30 p-3 rounded-lg">
            <p className="font-medium">{deliveryInfo.type}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {deliveryInfo.address}
            </p>
            {order.delivery_country && (
              <p className="text-sm text-muted-foreground">
                {order.delivery_country}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Informations de contact */}
      <div>
        <h4 className="font-semibold mb-3">Informations de contact</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{order.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{order.phone}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Récapitulatif financier */}
      <div>
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Récapitulatif
        </h4>
        <div className="space-y-2 bg-muted/30 p-3 rounded-lg">
          <div className="flex justify-between text-sm">
            <span>Sous-total</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Frais de port</span>
            <span>{formatPrice(order.shipping_cost)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Informations sur le paiement */}
      {order.stripe_payment_intent_id && (
        <div className="text-xs text-muted-foreground">
          ID de paiement : {order.stripe_payment_intent_id}
        </div>
      )}
    </div>
  )
}