import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Emails are sent via Supabase Edge Functions (database triggers)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      );
    }

    // Save message to database - Supabase Edge Functions will handle email sending
    const supabase = await createClient();

    const { data: contactMessage, error: dbError } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: 'new'
      } as never)
      .select()
      .single();

    if (dbError) {
      console.error("Erreur Supabase:", dbError);
      return NextResponse.json(
        { error: "Erreur lors de l'enregistrement du message" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Message envoyé avec succès", id: contactMessage?.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors du traitement du message:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}
