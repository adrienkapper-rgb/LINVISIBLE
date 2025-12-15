import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL || "adrienkapper@gmail.com";

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

    // Save message to database FIRST (before sending emails)
    const supabase = await createClient();
    console.log("Tentative d'enregistrement en base pour:", { name, email, subject });
    
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
      console.error("ERREUR Supabase:", dbError);
      console.log("Continuing with email sending despite DB error...");
      // Continue with email sending even if DB insert fails (fallback mode)
    }

    console.log("Message enregistré avec succès:", contactMessage);

    const phoneInfo = phone ? `\nTéléphone: ${phone}` : "";
    
    const emailContent = `
      <h2>Nouveau message de contact</h2>
      <p><strong>De:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Téléphone:</strong> ${phone}</p>` : ""}
      <p><strong>Objet:</strong> ${subject}</p>
      <br/>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `;

    const textContent = `
Nouveau message de contact

De: ${name}
Email: ${email}${phoneInfo}
Objet: ${subject}

Message:
${message}
    `;

    await resend.emails.send({
      from: "L'invisible <onboarding@resend.dev>",
      to: adminEmail,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      html: emailContent,
      text: textContent,
    });

    await resend.emails.send({
      from: "L'invisible <onboarding@resend.dev>",
      to: email,
      subject: "Confirmation de votre message - L'invisible",
      html: `
        <h2>Merci pour votre message</h2>
        <p>Bonjour ${name},</p>
        <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
        <br/>
        <p><strong>Rappel de votre message:</strong></p>
        <p><strong>Objet:</strong> ${subject}</p>
        <p>${message.replace(/\n/g, "<br/>")}</p>
        <br/>
        <p>Cordialement,<br/>L'équipe L'invisible</p>
      `,
      text: `
Merci pour votre message

Bonjour ${name},

Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.

Rappel de votre message:
Objet: ${subject}
${message}

Cordialement,
L'équipe L'invisible
      `,
    });

    return NextResponse.json(
      { message: "Message envoyé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi du message" },
      { status: 500 }
    );
  }
}