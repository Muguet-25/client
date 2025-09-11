import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForToken } from '@/lib/youtube/auth';

// 처리된 코드를 추적하는 Set (메모리 기반, 서버 재시작 시 초기화)
const processedCodes = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code) {
      return NextResponse.json(
        { message: '인증 코드가 필요합니다.' },
        { status: 400 }
      );
    }

    // 이미 처리된 코드인지 확인
    if (processedCodes.has(code)) {
      console.log('이미 처리된 인증 코드:', code.substring(0, 10) + '...');
      return NextResponse.json(
        { message: '이미 처리된 인증 코드입니다.' },
        { status: 400 }
      );
    }

    // 코드를 처리된 목록에 추가
    processedCodes.add(code);

    console.log('YouTube OAuth 토큰 교환 시작:', {
      clientId: process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID ? '설정됨' : '없음',
      clientSecret: process.env.YOUTUBE_CLIENT_SECRET ? '설정됨' : '없음',
      redirectUri: process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI,
      codeLength: code.length,
      codePrefix: code.substring(0, 10) + '...',
      actualClientId: process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID?.substring(0, 20) + '...',
      actualRedirectUri: process.env.NEXT_PUBLIC_YOUTUBE_REDIRECT_URI
    });

    // YouTube OAuth 토큰 교환
    const tokenData = await exchangeCodeForToken(code);

    console.log('YouTube OAuth 토큰 교환 성공:', {
      hasAccessToken: !!tokenData.access_token,
      hasRefreshToken: !!tokenData.refresh_token,
      tokenType: tokenData.token_type
    });

    return NextResponse.json({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      token_type: tokenData.token_type,
    });
  } catch (error) {
    console.error('YouTube OAuth 오류:', error);
    
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : '인증 처리 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}
