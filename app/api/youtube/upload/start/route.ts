import { NextRequest, NextResponse } from 'next/server';

// 참고: 이 엔드포인트는 OAuth 액세스 토큰을 헤더로 받아 YouTube Resumable Upload 세션을 생성합니다.
// 클라이언트는 반환된 Location URL로 파일을 PUT하여 업로드를 진행합니다.

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

    const {
      title,
      description,
      categoryId = '22',
      tags = [],
      privacyStatus = 'private',
      publishAt,
    } = body || {};

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }

    const metadata: any = {
      snippet: {
        title,
        description: description || '',
        categoryId,
        tags,
      },
      status: {
        privacyStatus,
      },
    };

    if (publishAt) {
      metadata.status.publishAt = publishAt;
    }

    // videos.insert resumable upload 초기화 요청
    const initUrl = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status';

    const initRes = await fetch(initUrl, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': 'video/*',
      },
      body: JSON.stringify(metadata),
    });

    if (!initRes.ok) {
      const errText = await initRes.text();
      return NextResponse.json({ error: 'Failed to create upload session', detail: errText }, { status: initRes.status });
    }

    const location = initRes.headers.get('location');
    if (!location) {
      return NextResponse.json({ error: 'Upload session URL not provided' }, { status: 500 });
    }

    // Location URL을 클라이언트에 반환
    return NextResponse.json({ uploadUrl: location }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Unexpected error', detail: e?.message || String(e) }, { status: 500 });
  }
}


