'use server';

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { video, metrics } = body ?? {};

    if (!video || !metrics) {
      return NextResponse.json(
        { error: 'video와 metrics 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    const {
      title = '제목 미확인',
      description = '',
      tags = [],
      publishedAt = '',
    } = video;

    const {
      retentionRate = 0,
      watchDuration = 0,
      videoDuration = 0,
      engagement = 0,
      avgEngagement = 0,
      views = 0,
      likes = 0,
      comments = 0,
      likeRate = 0,
      commentRate = 0,
      channelAvgViews = 0,
    } = metrics;

    const prompt = `
영상 제목: ${title}
설명: ${description}
태그: ${tags.join(', ')}
업로드일: ${publishedAt}

주요 지표:
- 평균 시청 지속시간 대비 영상 길이 비율: ${retentionRate.toFixed(1)}%
- 평균 시청 지속시간(초): ${watchDuration}
- 영상 길이(초): ${videoDuration}
- 참여도: ${engagement.toFixed(2)}% (채널 평균 ${avgEngagement.toFixed(2)}%)
- 조회수: ${views.toLocaleString()}
- 좋아요: ${likes.toLocaleString()}
- 댓글: ${comments.toLocaleString()}
- 좋아요 전환률: ${likeRate.toFixed(2)}%
- 댓글 전환률: ${commentRate.toFixed(2)}%

위 데이터를 기반으로 JSON 형태로 분석 결과를 작성하세요:
{
  "issues": [
    {
      "title": "짧은 문제 이름",
      "description": "해당 문제의 구체적인 설명",
      "severity": "high" | "medium" | "low"
    }
  ],
  "causes": [
    "문제 원인 1",
    "문제 원인 2"
  ],
  "retentionAnalysis": "시청 지속률에 대한 1문장 분석. 반드시 '조회수 ${views.toLocaleString()}, 채널 조회수 대비로 ~~' 형식으로 시작하며, 실제 시청 지속률(${retentionRate.toFixed(1)}%)을 언급하고 채널 평균과 비교한 평가를 제시하세요.",
  "engagementAnalysis": "좋아요와 댓글에 대한 통합 1문장 분석. 반드시 '조회수 ${views.toLocaleString()}, 좋아요 ${likes.toLocaleString()}, 댓글 ${comments.toLocaleString()}, 채널 조회수 대비로 ~~' 형식으로 시작하며, 실제 수치를 언급하고 채널 평균과 비교한 평가를 제시하세요."
}

- 최소 2개의 issue를 제시하고, 각 severity는 high/medium/low 중 하나로만 설정하세요.
- causes는 2~3개 문장으로, 실행 가능한 원인 분석만 작성하세요.
- retentionAnalysis는 1문장으로 작성하세요. 반드시 "조회수 ${views.toLocaleString()}, 채널 조회수 대비로 ~~" 형식으로 시작하며, 시청 지속률(${retentionRate.toFixed(1)}%)을 언급하고 채널 평균과 비교한 평가를 제시하세요.
- engagementAnalysis는 1문장으로 작성하세요. 반드시 "조회수 ${views.toLocaleString()}, 좋아요 ${likes.toLocaleString()}, 댓글 ${comments.toLocaleString()}, 채널 조회수 대비로 ~~" 형식으로 시작하며, 좋아요 수와 댓글 수를 언급하고, 채널 평균 참여도(${avgEngagement.toFixed(2)}%)와 비교한 평가를 제시하세요. "전환률"이라는 단어는 사용하지 마세요. 예: "조회수 ${views.toLocaleString()}, 좋아요 ${likes.toLocaleString()}, 댓글 ${comments.toLocaleString()}, 채널 조회수 대비로 좋아요 수가 적어 시청자들의 공감을 얻지 못하고 있습니다."
- JSON 외의 텍스트, 마크다운, 설명은 출력하지 마세요.
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.4,
      max_tokens: 600,
      messages: [
        {
          role: 'system',
          content:
            '당신은 유튜브 영상 성과 분석 전문가입니다. 사용자가 제공한 지표를 근거로 문제와 원인을 분석하고, 반드시 유효한 JSON만 반환하세요.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    let insights;

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      insights = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('AI JSON 파싱 실패:', parseError);
      insights = {
        issues: [],
        causes: [],
      };
    }

    return NextResponse.json({
      issues: insights.issues || [],
      causes: insights.causes || [],
      retentionAnalysis: insights.retentionAnalysis || '',
      engagementAnalysis: insights.engagementAnalysis || '',
    });
  } catch (error) {
    console.error('영상 AI 인사이트 생성 실패:', error);
    return NextResponse.json(
      {
        error: 'AI 분석을 생성하지 못했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류',
      },
      { status: 500 }
    );
  }
}

