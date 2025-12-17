import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, error: 'Code manquant' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Rechercher le code (insensible à la casse)
    const { data: discountCodeData, error } = await supabase
      .from('discount_codes')
      .select('id, code, amount, used')
      .ilike('code', code.trim())
      .single()

    const typedDiscountCode = discountCodeData as { id: string; code: string; amount: number; used: boolean | null } | null

    if (error || !typedDiscountCode) {
      return NextResponse.json(
        { valid: false, error: 'Code invalide' },
        { status: 200 }
      )
    }

    // Vérifier si le code est déjà utilisé
    if (typedDiscountCode.used) {
      return NextResponse.json(
        { valid: false, error: 'Ce code a déjà été utilisé' },
        { status: 200 }
      )
    }

    // Code valide
    return NextResponse.json({
      valid: true,
      code: typedDiscountCode.code,
      amount: Number(typedDiscountCode.amount)
    })

  } catch (error) {
    console.error('Erreur validation code promo:', error)
    return NextResponse.json(
      { valid: false, error: 'Erreur lors de la validation' },
      { status: 500 }
    )
  }
}
