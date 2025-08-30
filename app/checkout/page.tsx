import { CheckoutForm } from './CheckoutForm'
import { getUserInfo } from '@/app/actions/user'

export default async function CheckoutPage() {
  const user = await getUserInfo()
  
  return <CheckoutForm user={user} />
}