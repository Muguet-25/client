// YouTube OAuth 설정
export const YOUTUBE_OAUTH_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID || '',
  redirectUri: process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI || 'http://localhost:3000/auth/youtube/callback',
  scope: [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/youtube.force-ssl',
    'https://www.googleapis.com/auth/youtubepartner',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/yt-analytics-monetary.readonly',
  ].join(' '),
};

export const getYouTubeAuthUrl = (state?: string) => {
  const params = new URLSearchParams({
    client_id: YOUTUBE_OAUTH_CONFIG.clientId,
    redirect_uri: YOUTUBE_OAUTH_CONFIG.redirectUri,
    response_type: 'code',
    scope: YOUTUBE_OAUTH_CONFIG.scope,
    access_type: 'offline',
    prompt: 'consent',
    ...(state && { state }),
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const exchangeCodeForToken = async (code: string) => {
  const clientId = YOUTUBE_OAUTH_CONFIG.clientId;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const redirectUri = YOUTUBE_OAUTH_CONFIG.redirectUri;

  // 환경 변수 검증
  if (!clientId || !clientSecret) {
    throw new Error('YouTube 클라이언트 설정이 올바르지 않습니다.');
  }

  console.log('토큰 교환 요청 상세:', {
    clientId: clientId.substring(0, 20) + '...',
    clientSecret: clientSecret ? '설정됨' : '없음',
    redirectUri,
    codeLength: code.length,
    codePrefix: code.substring(0, 10) + '...'
  });

  const requestBody = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: requestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('YouTube OAuth 토큰 교환 오류:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      requestBody: Object.fromEntries(requestBody.entries())
    });
    throw new Error(`토큰 교환에 실패했습니다. (${response.status}): ${errorText}`);
  }

  return response.json();
};

export const refreshAccessToken = async (refreshToken: string) => {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: YOUTUBE_OAUTH_CONFIG.clientId,
      client_secret: process.env.YOUTUBE_CLIENT_SECRET || '',
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('토큰 갱신에 실패했습니다.');
  }

  return response.json();
};
