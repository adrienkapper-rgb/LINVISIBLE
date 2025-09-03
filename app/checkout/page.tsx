import { CheckoutForm } from './CheckoutForm'
import { LoginRequired } from '@/components/LoginRequired'
import { getUserInfo } from '@/app/actions/user'

export default async function CheckoutPage() {
  const user = await getUserInfo()
  
  // Si l'utilisateur n'est pas connecté, afficher la page de connexion obligatoire
  if (!user) {
    return <LoginRequired />
  }
  
  return <CheckoutForm user={user} />
}