import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadImage, deleteImage } from '@/lib/cloudinary';

// POST /api/upload  - body: { file: "data:image/...;base64,..." }  (admin only)
export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { file } = await request.json();
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const result = await uploadImage(file);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
  }
}

// DELETE /api/upload  - body: { publicId }  (admin only)
export async function DELETE(request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { publicId } = await request.json();
    await deleteImage(publicId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete image error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
