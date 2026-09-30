import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { INITIAL_CATEGORIES } from '@/data/initialProducts';
import { Category } from '@/types';
import { getAdminFromRequest } from '@/lib/auth/adminSession';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'categories.json');

export async function GET() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    const categories = JSON.parse(data);
    return NextResponse.json({
      success: true,
      categories,
    });
  } catch {
    return NextResponse.json({
      success: true,
      categories: INITIAL_CATEGORIES,
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
    let categoriesToSave: Category[];

    if (Array.isArray(body)) {
      categoriesToSave = body;
    } else if (body.categories && Array.isArray(body.categories)) {
      categoriesToSave = body.categories;
    } else if (body.category && typeof body.category === 'object') {
      // Single category update
      let existingCategories: Category[] = INITIAL_CATEGORIES;
      try {
        const fileData = await fs.readFile(dataFilePath, 'utf-8');
        existingCategories = JSON.parse(fileData);
      } catch {
        existingCategories = INITIAL_CATEGORIES;
      }
      categoriesToSave = existingCategories.map((cat) =>
        cat.id === body.category.id ? { ...cat, ...body.category } : cat
      );
      if (!existingCategories.some((c) => c.id === body.category.id)) {
        categoriesToSave.push(body.category);
      }
    } else {
      return NextResponse.json({ success: false, error: 'Invalid payload format' }, { status: 400 });
    }

    await fs.writeFile(dataFilePath, JSON.stringify(categoriesToSave, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      categories: categoriesToSave,
    });
  } catch (error) {
    console.error('Error saving categories in /api/categories:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to save categories' },
      { status: 500 }
    );
  }
}
