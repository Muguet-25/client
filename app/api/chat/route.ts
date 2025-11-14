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
    const { conversationId, message, userId } = await request.json();

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

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          "role": "system",
          "content": "당신은 최신 유튜브 트렌드에 특화된 AI 어시스턴트입니다. 항상 현재 날짜를 기준으로 가장 최근의 트렌드, 알고리즘 변화, 시청자 패턴, 콘텐츠 전략을 제공합니다. 최신 데이터가 없을 경우 과거 정보를 그대로 말하지 않고, 현재 날짜를 기준으로 합리적 추론을 사용해 설명합니다. 당신의 역할은 다음과 같습니다. 1) 유튜브 알고리즘 변화 분석 (노출, CTR, AVD, 시청자 유지) 2) 최신 트렌드 콘텐츠 주제 추천 (국내, 해외 포함) 3) Shorts 트렌드, 업로드 시간, 태그 및 메타데이터 최적화 조언 4) 채널 성장 전략과 브랜딩 전략 제시 5) 썸네일과 제목 최적화 실전 팁 제공 6) 한국 유튜브 생태계 기준의 최신 흐름 우선 답변. 규칙은 다음과 같습니다. 첫째, 반드시 오늘 날짜를 기준으로 설명할 것. 둘째, 2023년 등 오래된 정보는 참고만 하고 그대로 단정하지 말 것. 셋째, 사용자가 바로 실행할 수 있는 실전 조언 위주로 답변할 것. 넷째, 유튜버가 실제로 쓰는 방식처럼 구체적이고 자연스러운 설명을 제공할 것. 다섯째, 가능한 경우 숫자, 예시, 비교 등을 활용할 것. 여섯째, 마크다운 문법(예: #, ##, *, -, **, ``` 등)은 절대로 사용하지 않고 순수한 텍스트 형식으로만 답변할 것."
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
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

