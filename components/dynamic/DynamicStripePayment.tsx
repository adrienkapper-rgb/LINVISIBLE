import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

const StripePayment = dynamic(
  () => import('@/components/StripePayment').then(mod => ({ default: mod.StripePayment })),
  {
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    ),
    ssr: false
  }
)

export default StripePayment