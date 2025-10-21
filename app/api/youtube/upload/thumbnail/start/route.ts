import { NextRequest, NextResponse } from 'next/server';

// 썸네일 업로드를 위한 Resumable Upload 세션 생성
// 요청 헤더: Authorization: Bearer {access_token}
// 요청 바디: { videoId: string, mimeType?: string }

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Missing Authorization header' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 });
    }

    const body = await req.json().catch(() => ({} as any));
    const { videoId, mimeType = 'image/*' } = body || {};

    if (!videoId) {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
    }

    const initUrl = `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?uploadType=resumable&videoId=${encodeURIComponent(videoId)}`;

    const initRes = await fetch(initUrl, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'X-Upload-Content-Type': mimeType,
      },
    });

    if (!initRes.ok) {
      const errText = await initRes.text();
      return NextResponse.json({ error: 'Failed to create thumbnail upload session', detail: errText }, { status: initRes.status });
    }

    const location = initRes.headers.get('location');
    if (!location) {
      return NextResponse.json({ error: 'Thumbnail upload session URL not provided' }, { status: 500 });
    }

    return NextResponse.json({ uploadUrl: location }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Unexpected error', detail: e?.message || String(e) }, { status: 500 });
  }
}


