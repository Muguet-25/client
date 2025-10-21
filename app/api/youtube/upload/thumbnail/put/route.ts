import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const uploadUrl = String(form.get('uploadUrl') || '');
    const file = form.get('file') as unknown as Blob | null;
    const contentType = String(form.get('contentType') || 'image/*');

    if (!uploadUrl || !file) {
      return NextResponse.json({ error: 'uploadUrl and file are required' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const putRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.length),
      },
      body: buffer,
    });

    const text = await putRes.text();
    if (!putRes.ok) {
      return NextResponse.json({ error: 'Google thumbnail upload failed', detail: text }, { status: putRes.status });
    }

    try {
      const json = text ? JSON.parse(text) : {};
      return NextResponse.json(json, { status: 200 });
    } catch {
      return new NextResponse(text || '', { status: 200 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: 'Unexpected error', detail: e?.message || String(e) }, { status: 500 });
  }
}


