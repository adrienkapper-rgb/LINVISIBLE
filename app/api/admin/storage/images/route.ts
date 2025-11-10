import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const BUCKET_NAME = 'product-images';
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// GET: Liste toutes les images du bucket product-images
export async function GET() {
  try {
    const supabase = await createClient();

    // Vérifier l'authentification admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Lister tous les fichiers du bucket
    const { data: files, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      console.error('Erreur lors de la récupération des images:', error);
      return NextResponse.json({ error: 'Erreur lors de la récupération des images' }, { status: 500 });
    }

    // Générer les URLs publiques pour chaque image
    const imagesWithUrls = files
      .filter(file => !file.name.endsWith('/')) // Exclure les dossiers
      .map(file => {
        const { data } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(file.name);

        return {
          name: file.name,
          url: data.publicUrl,
          createdAt: file.created_at,
          size: file.metadata?.size || 0,
        };
      });

    return NextResponse.json({ images: imagesWithUrls });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST: Upload une nouvelle image
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Vérifier l'authentification admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 });
    }

    // Validation du type de fichier
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format de fichier non autorisé. Utilisez JPG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    // Validation de la taille
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Taille maximale: 5MB' },
        { status: 400 }
      );
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${cleanName}`;

    // Convertir le fichier en buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload vers Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Erreur lors de l\'upload:', error);
      return NextResponse.json({ error: 'Erreur lors de l\'upload de l\'image' }, { status: 500 });
    }

    // Récupérer l'URL publique
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      image: {
        name: fileName,
        url: urlData.publicUrl,
      },
    });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE: Supprimer une image du bucket
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();

    // Vérifier l'authentification admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL de l\'image requise' }, { status: 400 });
    }

    // Extraire le nom du fichier depuis l'URL
    const fileName = imageUrl.split('/').pop();
    if (!fileName) {
      return NextResponse.json({ error: 'URL invalide' }, { status: 400 });
    }

    // Vérifier si l'image est utilisée par des produits
    const { data: products, error: checkError } = await supabase
      .from('products')
      .select('id, name, image_url')
      .ilike('image_url', `%${fileName}%`);

    if (checkError) {
      console.error('Erreur lors de la vérification:', checkError);
    }

    const usedByCount = products?.length || 0;
    const wasUsed = usedByCount > 0;

    // Supprimer l'image du storage
    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (deleteError) {
      console.error('Erreur lors de la suppression:', deleteError);
      return NextResponse.json({ error: 'Erreur lors de la suppression de l\'image' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      wasUsed,
      usedByCount,
      products: wasUsed ? products?.map(p => ({ id: p.id, name: p.name })) : [],
    });
  } catch (error) {
    console.error('Erreur serveur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
