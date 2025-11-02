'use client';

import { supabase } from '@/utils/config';

export interface SubscriberHistoryEntry {
  id?: string;
  user_id: string;
  channel_id: string;
  subscriber_count: number;
  recorded_at: string;
}

/**
 * 현재 구독자 수를 히스토리에 기록
 */
export async function recordSubscriberCount(
  userId: string,
  channelId: string,
  subscriberCount: number
): Promise<SubscriberHistoryEntry | null> {
  try {
    const { data, error } = await supabase
      .from('subscriber_history')
      .insert({
        user_id: userId,
        channel_id: channelId,
        subscriber_count: subscriberCount,
        recorded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('구독자 수 기록 실패:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('구독자 수 기록 오류:', error);
    return null;
  }
}

/**
 * 특정 채널의 구독자 히스토리 조회
 */
export async function getSubscriberHistory(
  userId: string,
  channelId: string,
  limit: number = 100
): Promise<SubscriberHistoryEntry[]> {
  try {
    const { data, error } = await supabase
      .from('subscriber_history')
      .select('*')
      .eq('user_id', userId)
      .eq('channel_id', channelId)
      .order('recorded_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('구독자 히스토리 조회 실패:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('구독자 히스토리 조회 오류:', error);
    return [];
  }
}

/**
 * 오늘 이미 기록했는지 확인
 */
export async function hasRecordedToday(
  userId: string,
  channelId: string
): Promise<boolean> {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStart = today.toISOString();
    const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('subscriber_history')
      .select('id')
      .eq('user_id', userId)
      .eq('channel_id', channelId)
      .gte('recorded_at', todayStart)
      .lt('recorded_at', todayEnd)
      .limit(1);

    if (error) {
      console.error('오늘 기록 확인 실패:', error);
      return false;
    }

    return (data?.length || 0) > 0;
  } catch (error) {
    console.error('오늘 기록 확인 오류:', error);
    return false;
  }
}

/**
 * 구독자 히스토리를 그래프 데이터 형식으로 변환
 */
export function formatSubscriberHistoryForChart(
  history: SubscriberHistoryEntry[]
): Array<{ date: string; count: number }> {
  return history.map((entry) => ({
    date: formatDateForChart(entry.recorded_at),
    count: entry.subscriber_count,
  }));
}

/**
 * 날짜를 그래프 형식으로 포맷 (예: "2025-10")
 */
function formatDateForChart(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

