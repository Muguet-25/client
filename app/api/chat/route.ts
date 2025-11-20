import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// 서비스 역할 키 사용 (RLS 우회, 하지만 user_id 검증은 필수)
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});




export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, message, userId, accessToken } = body;

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
          title: message.length > 30 ? message.substring(0, 30) + '...' : message,
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

    // OpenAI API 호출
    const messages = history.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }));

    // 사용자의 채널 데이터 가져오기
    let channelContext = '';
    try {
      const token = accessToken || request.headers.get('x-youtube-token');
      
      if (token) {
        const { YouTubeAPI } = await import('@/lib/youtube/api');
        const youtubeAPI = new YouTubeAPI(token);
        
        try {
          const channel = await youtubeAPI.getChannelInfo();
          const videos = await youtubeAPI.getVideos(undefined, 5);
          
          const endDate = new Date().toISOString().split('T')[0];
          const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const analytics = await youtubeAPI.getChannelAnalytics(channel.id, startDate, endDate);
          
          channelContext = `
사용자의 채널 데이터:
- 채널명: ${channel.title}
- 구독자 수: ${parseInt(channel.statistics.subscriberCount || '0').toLocaleString()}명
- 총 영상 수: ${channel.statistics.videoCount}개
- 최근 30일 조회수: ${analytics.views.toLocaleString()}
- 최근 30일 평균 시청 지속시간: ${analytics.averageViewDuration}
- 최근 30일 CTR: ${(analytics.ctr ?? 0).toFixed(2)}%
- 최근 30일 구독자 증가: ${analytics.subscribersGained}명

최근 영상 5개:
${videos.map((v, i) => `
${i + 1}. ${v.title}
   - 조회수: ${parseInt(v.statistics.viewCount || '0').toLocaleString()}
   - 좋아요: ${parseInt(v.statistics.likeCount || '0').toLocaleString()}
   - 업로드일: ${new Date(v.publishedAt).toLocaleDateString('ko-KR')}
`).join('')}
`;
        } catch (error) {
          console.error('채널 데이터 가져오기 실패:', error);
        }
      }
    } catch (error) {
      console.error('채널 데이터 처리 오류:', error);
    }
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: "system",
          content: `당신은 사용자의 유튜브 채널 데이터를 기반으로 맞춤형 조언을 제공하는 AI 코치입니다. 

${channelContext ? `현재 사용자의 채널 데이터가 제공되었습니다. 이 데이터를 기반으로 개인화된 조언을 제공하세요.` : '채널 데이터가 제공되지 않았습니다. 일반적인 유튜브 전략과 최신 트렌드를 바탕으로 조언을 제공하세요.'}

당신의 핵심 역할:
1. 사용자의 채널 데이터(상위 영상 주제, 길이, 썸네일 스타일, 시청자 연령/성비, 업로드 패턴 등)를 분석하여 개인화된 조언 제공
2. 데이터 기반 의사결정 지원: "이번 주에 뭘 찍는 게 좋을까?", "지난주 영상 중에 리메이크하면 좋을 것 같은 거 골라줘", "10분짜리로 올릴까 쇼츠로 쪼갤까?" 같은 질문에 구체적 답변
3. 항상 데이터 근거를 포함한 답변 제공 (예: "최근 3개월 동안 8-10분 영상의 평균 시청 지속시간이 65%로 가장 높고, 쇼츠는 구독자 전환율이 낮습니다. 그래서 이번 주는 8-10분 길이의 정보형 영상 1개를 추천합니다.")
4. 실행 가능한 액션 아이템 제시: 단순 조언이 아닌 "오늘 바로 할 수 있는 3가지" 같은 구체적 실행 계획
5. 경쟁 채널/시장 트렌드 분석 및 적용 방안 제시

답변 규칙:
- 마크다운 문법(#, ##, *, -, **, \`\`\` 등)은 절대로 사용하지 않고 순수한 텍스트 형식으로만 답변
- 숫자, 통계, 비교 데이터를 적극 활용
- 사용자의 채널 특성에 맞춘 개인화된 조언 제공
- 실행 가능한 구체적 액션 위주로 답변
- 유튜버가 실제로 쓰는 방식처럼 자연스럽고 실용적인 설명
${channelContext ? '- 제공된 채널 데이터의 구체적인 숫자와 통계를 활용하여 답변하세요.' : ''}`
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const aiResponse = completion.choices[0]?.message?.content || '응답을 생성할 수 없습니다.';

    // AI 응답 저장
    const { error: aiMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: currentConversationId,
        role: 'assistant',
        content: aiResponse,
      });

    if (aiMsgError) {
      console.error('AI 메시지 저장 실패:', aiMsgError);
      return NextResponse.json(
        { error: 'AI 응답 저장에 실패했습니다.' },
        { status: 500 }
      );
    }

    // 대화방 제목 업데이트 (첫 메시지인 경우)
    if (history.length === 1) {
      const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
      await supabase
        .from('conversations')
        .update({ title })
        .eq('id', currentConversationId);
    }

    return NextResponse.json({
      message: aiResponse,
      conversationId: currentConversationId,
    });
  } catch (error) {
    console.error('챗봇 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

