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

    if (!conversationId || !message || !userId) {
      return NextResponse.json(
        { error: 'conversationId, message, userId가 필요합니다.' },
        { status: 400 }
      );
    }

    // 사용자 인증 확인
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, user_id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (convError || !conversation) {
      return NextResponse.json(
        { error: '대화방을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 사용자 메시지 저장
    const { error: userMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
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
      .eq('conversation_id', conversationId)
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
          role: 'system',
          content: '당신은 유튜브 트렌드에 특화된 AI 어시스턴트입니다. 사용자에게 유튜브 트렌드, 콘텐츠 제작, 채널 성장에 대한 조언을 제공합니다.',
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
        conversation_id: conversationId,
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
        .eq('id', conversationId);
    }

    return NextResponse.json({
      message: aiResponse,
      conversationId,
    });
  } catch (error) {
    console.error('챗봇 API 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

