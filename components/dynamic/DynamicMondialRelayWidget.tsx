import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const MondialRelayWidget = dynamic(
  () => import('@/components/MondialRelayWidget').then(mod => ({ default: mod.MondialRelayWidget })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="text-sm text-muted-foreground">
          <p>• Livraison sous 3-5 jours ouvrés</p>
          <p>• Retrait gratuit en point relais</p>
          <p>• Disponible dans toute la France</p>
        </div>
      </div>
    ),
    ssr: false
  }
)

export default MondialRelayWidget