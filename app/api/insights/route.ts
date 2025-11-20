import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { YouTubeAPI } from '@/lib/youtube/api';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

export async function POST(request: NextRequest) {
  try {
    const { accessToken, channelId } = await request.json();

    if (!accessToken || !channelId) {
      return NextResponse.json(
        { error: 'accessToken과 channelId가 필요합니다.' },
        { status: 400 }
      );
    }

    const youtubeAPI = new YouTubeAPI(accessToken);

    // 채널 정보 가져오기
    const channel = await youtubeAPI.getChannelInfo(channelId);
    
    // 최근 30일 비디오 가져오기
    const videos = await youtubeAPI.getVideos(channelId, 10);
    
    // 최근 30일 분석 데이터 가져오기
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
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

    // 채널 데이터 요약
    const channelSummary = {
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

