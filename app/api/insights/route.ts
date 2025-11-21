import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { YouTubeAPI } from '@/lib/youtube/api';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export async function POST(request: NextRequest) {
  try {
    const { accessToken, channelId, cachedData } = await request.json();

    if (!channelId) {
      return NextResponse.json(
        { error: 'channelId가 필요합니다.' },
        { status: 400 }
      );
    }

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let channelSummary;

    // 캐시된 데이터가 있으면 우선 사용 (할당량 초과 시 대응)
    if (cachedData) {
      console.log('캐시된 데이터를 사용하여 인사이트 생성');
      const { channel, videos, analytics, videoAnalyticsMap } = cachedData;

      // videoAnalyticsMap이 객체로 전달되므로 Map으로 변환
      const videoAnalyticsMapObj = videoAnalyticsMap as Record<string, { averageViewDuration: string }> || {};

      // 상위 3개 비디오 선택
      const topVideos = [...videos]
        .filter((video: any) => video.status?.privacyStatus === 'public')
        .sort((a: any, b: any) => {
          const viewsA = parseInt(a.statistics?.viewCount || '0', 10);
          const viewsB = parseInt(b.statistics?.viewCount || '0', 10);
          return viewsB - viewsA;
        })
        .slice(0, 3);

      // 평균 조회수 계산
      const avgViews = videos.length > 0
        ? videos.reduce((sum: number, v: any) => sum + parseInt(v.statistics?.viewCount || '0'), 0) / videos.length
        : 0;

      // 평균 좋아요 계산
      const avgLikes = videos.length > 0
        ? videos.reduce((sum: number, v: any) => sum + parseInt(v.statistics?.likeCount || '0'), 0) / videos.length
        : 0;

      channelSummary = {
        channelName: channel?.title || '알 수 없음',
        subscriberCount: parseInt(channel?.statistics?.subscriberCount || '0'),
        totalVideos: parseInt(channel?.statistics?.videoCount || '0'),
        recent30Days: {
          views: analytics?.views || 0,
          avgWatchDuration: analytics?.averageViewDuration || '0:00',
          subscribersGained: analytics?.subscribersGained || 0,
        },
        topVideos: topVideos.map((video: any) => {
          const videoAnalytics = videoAnalyticsMapObj[video.id];
          return {
            title: video.title || '제목 없음',
            views: parseInt(video.statistics?.viewCount || '0'),
            likes: parseInt(video.statistics?.likeCount || '0'),
            avgWatchDuration: videoAnalytics?.averageViewDuration || '0:00',
            publishedAt: video.publishedAt || '',
          };
        }),
        averageViews: Math.round(avgViews),
        averageLikes: Math.round(avgLikes),
      };
    } else {
      // 캐시된 데이터가 없으면 YouTube API 호출
      if (!accessToken) {
        return NextResponse.json(
          { error: 'accessToken 또는 cachedData가 필요합니다.' },
          { status: 400 }
        );
      }

      const youtubeAPI = new YouTubeAPI(accessToken);

      try {
        // 채널 정보 가져오기
        const channel = await youtubeAPI.getChannelInfo(channelId);
        
        // 최근 30일 비디오 가져오기
        const videos = await youtubeAPI.getVideos(channelId, 10);
        
        // 최근 30일 분석 데이터 가져오기
        const analytics = await youtubeAPI.getChannelAnalytics(channelId, startDate, endDate);

        // 상위 3개 비디오 분석
        const topVideos = videos.slice(0, 3);
        const videoAnalyticsMap = await youtubeAPI.getMultipleVideoAnalytics(
          topVideos.map(v => v.id),
          startDate,
          endDate
        );

        // 평균 조회수 계산
        const avgViews = videos.length > 0
          ? videos.reduce((sum, v) => sum + parseInt(v.statistics.viewCount || '0'), 0) / videos.length
          : 0;

        // 평균 좋아요 계산
        const avgLikes = videos.length > 0
          ? videos.reduce((sum, v) => sum + parseInt(v.statistics.likeCount || '0'), 0) / videos.length
          : 0;

        channelSummary = {
          channelName: channel.title,
          subscriberCount: parseInt(channel.statistics.subscriberCount || '0'),
          totalVideos: parseInt(channel.statistics.videoCount || '0'),
          recent30Days: {
            views: analytics.views,
            avgWatchDuration: analytics.averageViewDuration,
            subscribersGained: analytics.subscribersGained,
          },
          topVideos: topVideos.map(video => {
            const videoAnalytics = videoAnalyticsMap.get(video.id);
            return {
              title: video.title,
              views: parseInt(video.statistics.viewCount || '0'),
              likes: parseInt(video.statistics.likeCount || '0'),
              avgWatchDuration: videoAnalytics?.averageViewDuration || '0:00',
              publishedAt: video.publishedAt,
            };
          }),
          averageViews: Math.round(avgViews),
          averageLikes: Math.round(avgLikes),
        };
      } catch (apiError: any) {
        // YouTube API 호출 실패 시 (할당량 초과 등)
        console.error('YouTube API 호출 실패, 캐시된 데이터 사용 시도:', apiError);
        
        // 에러 메시지에 할당량 초과가 포함되어 있으면 캐시 사용 안내
        if (apiError?.message?.includes('quota') || apiError?.message?.includes('할당량')) {
          return NextResponse.json(
            { 
              error: 'YouTube API 할당량이 초과되었습니다. 클라이언트에서 캐시된 데이터를 전달해주세요.',
              requiresCachedData: true
            },
            { status: 429 }
          );
        }
        
        throw apiError;
      }
    }

    // channelSummary가 설정되지 않았으면 에러
    if (!channelSummary) {
      return NextResponse.json(
        { error: '채널 데이터를 가져올 수 없습니다.' },
        { status: 500 }
      );
    }

    // OpenAI로 인사이트 생성
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `당신은 유튜브 채널 데이터 분석 전문가입니다. 제공된 채널 데이터를 분석하여 다음 형식으로 JSON을 반환하세요:

{
  "diagnosis": "오늘의 한 줄 진단 (예: 시청 지속시간이 낮아요. 후킹 부분을 보완한 리메이크를 추천합니다.)",
  "weeklyGoal": "이번 주 목표 (예: 이번 주 목표: 평균 조회수 20% 상승)",
  "actions": [
    "액션 1",
    "액션 2",
    "액션 3"
  ]
}

답변은 반드시 유효한 JSON 형식이어야 하며, 마크다운이나 추가 설명 없이 JSON만 반환하세요.`
        },
        {
          role: 'user',
          content: `다음 채널 데이터를 분석해주세요:

채널명: ${channelSummary.channelName}
구독자 수: ${channelSummary.subscriberCount.toLocaleString()}명
총 영상 수: ${channelSummary.totalVideos}개

최근 30일 성과:
- 조회수: ${channelSummary.recent30Days.views.toLocaleString()}
- 평균 시청 지속시간: ${channelSummary.recent30Days.avgWatchDuration}
- 구독자 증가: ${channelSummary.recent30Days.subscribersGained}명

상위 3개 영상:
${channelSummary.topVideos.map((v, i) => `
${i + 1}. ${v.title}
   - 조회수: ${v.views.toLocaleString()}
   - 좋아요: ${v.likes.toLocaleString()}
   - 평균 시청 지속시간: ${v.avgWatchDuration}
`).join('')}

평균 조회수: ${channelSummary.averageViews.toLocaleString()}
평균 좋아요: ${channelSummary.averageLikes.toLocaleString()}

이 데이터를 바탕으로 오늘의 한 줄 진단, 이번 주 목표, 그리고 목표 달성을 위한 구체적인 액션 3가지를 제시해주세요.`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    
    // JSON 파싱 (마크다운 코드 블록 제거)
    let insights;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0]);
      } else {
        insights = JSON.parse(responseText);
      }
    } catch (error) {
      console.error('JSON 파싱 실패:', error);
      // 기본값 반환
      insights = {
        diagnosis: '데이터 분석 중입니다.',
        weeklyGoal: '이번 주 목표를 설정해주세요.',
        actions: [
          '상위 영상 분석하기',
          '업로드 시간 최적화하기',
          '썸네일 개선하기'
        ]
      };
    }

    return NextResponse.json({
      success: true,
      insights,
      channelSummary,
    });
  } catch (error) {
    console.error('인사이트 생성 오류:', error);
    return NextResponse.json(
      { 
        error: '인사이트 생성에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

