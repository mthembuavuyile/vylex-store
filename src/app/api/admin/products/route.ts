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

    // Adding a single product
    const { data, error } = await db.from('products').insert([body]);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, product: body });
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
