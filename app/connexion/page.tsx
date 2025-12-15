import { Suspense } from 'react'
import ConnexionContent from './ConnexionContent'

export default function ConnexionPage() {
  return (
    <Suspense 
      fallback={
        <div className="container max-w-lg mx-auto px-4 py-16 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      }
    >
      <ConnexionContent />
    </Suspense>
  )
}