import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// 클라이언트로부터 파일(form-data)과 uploadUrl, contentType을 받아
// Google Resumable Upload URL로 서버에서 PUT 요청을 프록시합니다.
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const uploadUrl = String(form.get('uploadUrl') || '');
    const file = form.get('file') as unknown as Blob | null;
    const contentType = String(form.get('contentType') || 'video/*');

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
      return NextResponse.json({ error: 'Google upload failed', detail: text }, { status: putRes.status });
    }

    // Google 응답은 JSON 문자열일 수도, 비어있을 수도 있음
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


