import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { INITIAL_PRODUCTS } from '@/data/initialProducts';
import { Product } from '@/types';
import { getAdminFromRequest } from '@/lib/auth/adminSession';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'products.json');

export async function GET() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const products = JSON.parse(data);
    return NextResponse.json({
      success: true,
      products,
    });
  } catch {
    return NextResponse.json({
      success: true,
      products: INITIAL_PRODUCTS,
    });
  }
}

export async function POST(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin.valid) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin privileges required' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    let productsToSave: Product[];

    if (Array.isArray(body)) {
      productsToSave = body;
    } else if (body.products && Array.isArray(body.products)) {
      productsToSave = body.products;
    } else if (body.product && typeof body.product === 'object') {
      let existingProducts: Product[] = INITIAL_PRODUCTS;
      try {
        const fileData = await fs.readFile(dataFilePath, 'utf-8');
        existingProducts = JSON.parse(fileData);
      } catch {
        existingProducts = INITIAL_PRODUCTS;
      }
      productsToSave = existingProducts.map((p) =>
        p.id === body.product.id ? { ...p, ...body.product } : p
      );
      if (!existingProducts.some((p) => p.id === body.product.id)) {
        productsToSave.unshift(body.product);
      }
    } else {
      return NextResponse.json({ success: false, error: 'Invalid payload format' }, { status: 400 });
    }

    await fs.writeFile(dataFilePath, JSON.stringify(productsToSave, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      products: productsToSave,
    });
  } catch (error) {
    console.error('Error saving products in /api/products:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to save products' },
      { status: 500 }
    );
  }
}
