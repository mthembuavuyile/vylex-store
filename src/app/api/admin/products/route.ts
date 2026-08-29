import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { supabase } from '@/lib/supabase';

// Helper to get client - tries supabaseAdmin service role first, falls back to public client
function getClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && serviceKey !== 'your_supabase_service_role_key_here') {
    return supabaseAdmin;
  }
  return supabase;
}

// GET: List all products for admin
export async function GET() {
  try {
    const db = getClient();
    const { data, error } = await db
      .from('products')
      .select('id, title, slug, category, vendor, price, compare_at_price, sku, stock_quantity, low_stock_threshold, allow_backorder, description, specifications, images, tags, status, is_featured, weight_kg, seo_title, seo_description, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ products: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// POST: Add or Seed Products
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getClient();

    if (Array.isArray(body)) {
      // Seeding multiple products
      const { data, error } = await db.from('products').upsert(body, { onConflict: 'id' });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, count: body.length });
    }

    // Adding or updating a single product
    const { data, error } = await db.from('products').upsert([body], { onConflict: 'id' });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, product: body });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// PUT / PATCH: Update existing product
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Missing product ID for update' }, { status: 400 });
    }

    const db = getClient();
    const updatePayload = {
      ...body,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await db
      .from('products')
      .update(updatePayload)
      .eq('id', body.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, product: updatePayload });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

// DELETE: Remove Product
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    const db = getClient();
    const { error } = await db.from('products').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
