import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export const runtime = 'edge'; // 가능하면 edge 런타임 사용 (스트리밍에 유리)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// 서비스 역할 키 사용 (RLS 우회, 하지만 user_id 검증은 필수)
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, message, userId, accessToken, channelContext } = body;

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'message, userId가 필요합니다.' },
        { status: 400 }
      );
    }

    let currentConversationId = conversationId;

    // conversationId가 없으면 새 대화방 생성
    if (!currentConversationId) {
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          user_id: userId,
          title:
            message.length > 30
              ? message.substring(0, 30) + '...'
              : message,
        })
        .select('id')
        .single();

      if (createError || !newConversation) {
        console.error('대화방 생성 실패:', createError);
        return NextResponse.json(
          { error: '대화방 생성에 실패했습니다.' },
          { status: 500 }
        );
      }

      currentConversationId = newConversation.id;
    } else {
      // conversationId가 있으면 사용자 인증 확인
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id, user_id')
        .eq('id', currentConversationId)
        .eq('user_id', userId)
        .single();

      if (convError || !conversation) {
        return NextResponse.json(
          { error: '대화방을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
    }

    // 사용자 메시지 저장
    const { error: userMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: currentConversationId,
        role: 'user',
        content: message,
      });

    if (userMsgError) {
      console.error('사용자 메시지 저장 실패:', userMsgError);
      return NextResponse.json(
        { error: '메시지 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 대화 히스토리 가져오기
    const { data: history, error: historyError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', currentConversationId)
      .order('created_at', { ascending: true });

    if (historyError) {
      console.error('대화 히스토리 조회 실패:', historyError);
      return NextResponse.json(
        { error: '대화 히스토리를 가져올 수 없습니다.' },
        { status: 500 }
      );
    }

    const messages = history.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // 사용자의 채널 데이터 가져오기
    let channelContextString = '';
    
    // 클라이언트에서 미리 준비된 채널 정보가 있으면 사용
    if (channelContext && channelContext.channel) {
      const { channel: ch, videos: vs, analytics: analyticsData } = channelContext;
      
      channelContextString = `
사용자의 채널 데이터:
- 채널명: ${ch.title || '알 수 없음'}
- 구독자 수: ${parseInt(
        ch.statistics?.subscriberCount || '0'
      ).toLocaleString()}명
- 총 영상 수: ${ch.statistics?.videoCount || 0}개
${analyticsData ? `
- 최근 30일 조회수: ${analyticsData.views?.toLocaleString() || 0}
- 최근 30일 평균 시청 지속시간: ${analyticsData.averageViewDuration ? `${Math.floor(analyticsData.averageViewDuration / 60)}분 ${analyticsData.averageViewDuration % 60}초` : '0초'}
- 최근 30일 구독자 증가: ${analyticsData.subscribersGained || 0}명` : ''}

최근 영상 ${vs.length}개:
${vs
  .map(
    (v: { title?: string; statistics?: { viewCount?: string; likeCount?: string }; publishedAt?: string }, i: number) => `
${i + 1}. ${v.title || '제목 없음'}
   - 조회수: ${parseInt(
     v.statistics?.viewCount || '0'
   ).toLocaleString()}
   - 좋아요: ${parseInt(
     v.statistics?.likeCount || '0'
   ).toLocaleString()}
   - 업로드일: ${v.publishedAt ? new Date(
     v.publishedAt
   ).toLocaleDateString('ko-KR') : '알 수 없음'}`
  )
  .join('')}
`;
    } else {
      // 클라이언트에서 정보가 없으면 서버에서 가져오기 (기존 방식)
      try {
        const token = accessToken || request.headers.get('x-youtube-token');

        if (token) {
          const { YouTubeAPI } = await import('@/lib/youtube/api');
          const youtubeAPI = new YouTubeAPI(token);

          try {
            const channel = await youtubeAPI.getChannelInfo();
            const videos = await youtubeAPI.getVideos(undefined, 5);

            const endDate = new Date().toISOString().split('T')[0];
            const startDate = new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split('T')[0];
            const analytics = await youtubeAPI.getChannelAnalytics(
              channel.id,
              startDate,
              endDate
            );

            channelContextString = `
사용자의 채널 데이터:
- 채널명: ${channel.title}
- 구독자 수: ${parseInt(
              channel.statistics.subscriberCount || '0'
            ).toLocaleString()}명
- 총 영상 수: ${channel.statistics.videoCount}개
- 최근 30일 조회수: ${analytics.views.toLocaleString()}
- 최근 30일 평균 시청 지속시간: ${analytics.averageViewDuration ? `${Math.floor(analytics.averageViewDuration / 60)}분 ${analytics.averageViewDuration % 60}초` : '0초'}
- 최근 30일 구독자 증가: ${analytics.subscribersGained}명

최근 영상 5개:
${videos
  .map(
    (v, i) => `
${i + 1}. ${v.title}
   - 조회수: ${parseInt(
     v.statistics.viewCount || '0'
   ).toLocaleString()}
   - 좋아요: ${parseInt(
     v.statistics.likeCount || '0'
   ).toLocaleString()}
   - 업로드일: ${new Date(
     v.publishedAt
   ).toLocaleDateString('ko-KR')}`
  )
  .join('')}
`;
          } catch (error) {
            console.error('채널 데이터 가져오기 실패:', error);
          }
        }
      } catch (error) {
        console.error('채널 데이터 처리 오류:', error);
      }
    }

    const systemPrompt = `당신은 사용자의 유튜브 채널 데이터를 기반으로 맞춤형 조언을 제공하는 AI 코치입니다. 

${
  channelContextString
    ? `현재 사용자의 채널 데이터가 제공되었습니다. 이 데이터를 기반으로 개인화된 조언을 제공하세요.`
    : '채널 데이터가 제공되지 않았습니다. 일반적인 유튜브 전략과 최신 트렌드를 바탕으로 조언을 제공하세요.'
}

당신의 핵심 역할:
1. 사용자의 채널 데이터(상위 영상 주제, 길이, 썸네일 스타일, 시청자 연령/성비, 업로드 패턴 등)를 분석하여 개인화된 조언 제공
2. 데이터 기반 의사결정 지원: "이번 주에 뭘 찍는 게 좋을까?", "지난주 영상 중에 리메이크하면 좋을 것 같은 거 골라줘", "10분짜리로 올릴까 쇼츠로 쪼갤까?" 같은 질문에 구체적 답변
3. 항상 데이터 근거를 포함한 답변 제공 (예: "최근 3개월 동안 8-10분 영상의 평균 시청 지속시간이 65%로 가장 높고, 쇼츠는 구독자 전환율이 낮습니다. 그래서 이번 주는 8-10분 길이의 정보형 영상 1개를 추천합니다.")
4. 실행 가능한 액션 아이템 제시: 단순 조언이 아닌 "오늘 바로 할 수 있는 3가지" 같은 구체적 실행 계획
5. 경쟁 채널/시장 트렌드 분석 및 적용 방안 제시

답변 규칙:
- 마크다운 문법(#, ##, *, -, **, \`\`\` 등)은 절대로 사용하지 않고 순수한 텍스트 형식으로만 답변
- 마크다운 문법 제발 사용 금지
- 숫자, 통계, 비교 데이터를 적극 활용
- 사용자의 채널 특성에 맞춘 개인화된 조언 제공
- 실행 가능한 구체적 액션 위주로 답변
- 유튜버가 실제로 쓰는 방식처럼 자연스럽고 실용적인 설명
${
  channelContextString
    ? '- 제공된 채널 데이터의 구체적인 숫자와 통계를 활용하여 답변하세요.'
    : ''
}`;

    // OpenAI 스트리밍 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      stream: true,
      messages: [
        { 
          role: 'system', 
          content: systemPrompt + (channelContextString ? `\n\n${channelContextString}` : '')
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const encoder = new TextEncoder();
    let fullResponse = '';

    // 서버 → 클라이언트 스트림
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 1) 먼저 메타 정보(conversationId)를 JSON 한 줄로 보냄
          const meta = JSON.stringify({
            type: 'meta',
            conversationId: currentConversationId,
          });
          controller.enqueue(encoder.encode(meta + '\n'));

          // 2) OpenAI 토큰을 읽으면서 계속 전송
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content || '';
            if (!delta) continue;

            fullResponse += delta;

            const payload = JSON.stringify({
              type: 'delta',
              content: delta,
            });
            controller.enqueue(encoder.encode(payload + '\n'));
          }

          // 3) 전체 응답이 완성된 뒤 Supabase에 저장
          const aiResponse =
            fullResponse || '응답을 생성할 수 없습니다.';

          const { error: aiMsgError } = await supabase
            .from('messages')
            .insert({
              conversation_id: currentConversationId,
              role: 'assistant',
              content: aiResponse,
            });

          if (aiMsgError) {
            console.error('AI 메시지 저장 실패:', aiMsgError);
          }

          // 첫 메시지인 경우 대화방 제목 업데이트
          if (history.length === 1) {
            const title =
              message.length > 30
                ? message.substring(0, 30) + '...'
                : message;
            await supabase
              .from('conversations')
              .update({ title })
              .eq('id', currentConversationId);
          }

          // 마지막에 done 이벤트 하나 더 보내도 됨 (선택)
          const doneEvent = JSON.stringify({ type: 'done' });
          controller.enqueue(encoder.encode(doneEvent + '\n'));

          controller.close();
        } catch (err) {
          console.error('스트리밍 중 오류:', err);
          // 에러 정보를 클라이언트로 보내고 스트림 종료
          const errorEvent = JSON.stringify({
            type: 'error',
            message: '스트리밍 중 오류가 발생했습니다.',
          });
          try {
            controller.enqueue(encoder.encode(errorEvent + '\n'));
          } catch (_) {
            // ignore
          }
          controller.error(err);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error) {
    console.error('챗봇 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}