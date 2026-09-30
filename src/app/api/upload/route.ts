import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getAdminFromRequest } from '@/lib/auth/adminSession';

export async function POST(request: NextRequest) {
  const admin = getAdminFromRequest(request);
  if (!admin.valid) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Admin privileges required' },
      { status: 401 }
    );
  }

  try {
    const contentType = request.headers.get('content-type') || '';

    // Create target uploads directory
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'categories');
    await fs.mkdir(uploadsDir, { recursive: true });

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const files = formData.getAll('file') as File[];

      if (!files || files.length === 0) {
        // Check for 'images' or single 'image' field
        const fallbackFile = (formData.get('image') || formData.get('files')) as File;
        if (fallbackFile && typeof fallbackFile === 'object' && 'arrayBuffer' in fallbackFile) {
          files.push(fallbackFile);
        }
      }

      if (files.length === 0) {
        return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 });
      }

      const uploadedUrls: string[] = [];

      for (const file of files) {
        if (!file || typeof file === 'string' || !file.name) continue;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize file name
        const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const timestamp = Date.now();
        const randomSuffix = Math.floor(Math.random() * 1000);
        const filename = `${timestamp}_${randomSuffix}_${cleanName}`;
        const filePath = path.join(uploadsDir, filename);

        await fs.writeFile(filePath, buffer);
        uploadedUrls.push(`/uploads/categories/${filename}`);
      }

      return NextResponse.json({
        success: true,
        url: uploadedUrls[0],
        urls: uploadedUrls,
      });
    }

    // Support JSON base64 payload as alternative
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const { filename = 'category_image.jpg', data } = body;

      if (!data) {
        return NextResponse.json({ success: false, error: 'No image data provided' }, { status: 400 });
      }

      const base64Data = data.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}_${cleanName}`;
      const filePath = path.join(uploadsDir, uniqueFilename);

      await fs.writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/categories/${uniqueFilename}`,
      });
    }

    return NextResponse.json({ success: false, error: 'Unsupported content type' }, { status: 400 });
  } catch (error) {
    console.error('Error in /api/upload:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
