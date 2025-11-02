'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/useAuthStore';
import { useYouTube } from './useYouTube';
import {
  getSubscriberHistory,
  recordSubscriberCount,
  hasRecordedToday,
  formatSubscriberHistoryForChart,
  SubscriberHistoryEntry,
} from '@/lib/subscriberHistory';

export function useSubscriberHistory() {
  const { user } = useAuthStore();
  const { channel, isConnected } = useYouTube();
  const [history, setHistory] = useState<SubscriberHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 구독자 히스토리 로드
  const loadHistory = useCallback(async () => {
    if (!user?.id || !channel?.id) {
      setHistory([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await getSubscriberHistory(user.id, channel.id);
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '히스토리 로드 실패');
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, channel?.id]);

  // 현재 구독자 수 기록
  const recordCurrentSubscriberCount = useCallback(async () => {
    if (!user?.id || !channel?.id || !channel.statistics?.subscriberCount) {
      return false;
    }

    // 오늘 이미 기록했는지 확인
    const alreadyRecorded = await hasRecordedToday(user.id, channel.id);
    if (alreadyRecorded) {
      console.log('오늘 이미 구독자 수를 기록했습니다.');
      return false;
    }

    try {
      const subscriberCount = parseInt(channel.statistics.subscriberCount);
      await recordSubscriberCount(user.id, channel.id, subscriberCount);
      
      // 히스토리 다시 로드
      await loadHistory();
      
      return true;
    } catch (err) {
      console.error('구독자 수 기록 실패:', err);
      return false;
    }
  }, [user?.id, channel?.id, channel?.statistics?.subscriberCount, loadHistory]);

  // 초기 로드 및 채널 변경 시 히스토리 로드
  useEffect(() => {
    if (isConnected && user?.id && channel?.id) {
      loadHistory();
    }
  }, [isConnected, user?.id, channel?.id, loadHistory]);

  // 구독자 수가 변경되면 자동 기록 (하루에 한 번)
  useEffect(() => {
    if (isConnected && user?.id && channel?.id && channel.statistics?.subscriberCount) {
      // 1분 후에 기록 (초기 로딩 후)
      const timer = setTimeout(() => {
        recordCurrentSubscriberCount();
      }, 60000); // 1분 후

      return () => clearTimeout(timer);
    }
  }, [isConnected, user?.id, channel?.id, channel?.statistics?.subscriberCount, recordCurrentSubscriberCount]);

  // 그래프용 데이터 포맷
  const chartData = formatSubscriberHistoryForChart(history);

  // 현재 구독자 수
  const currentSubscriberCount = channel?.statistics?.subscriberCount
    ? parseInt(channel.statistics.subscriberCount)
    : 0;

  return {
    history,
    chartData,
    currentSubscriberCount,
    isLoading,
    error,
    loadHistory,
    recordCurrentSubscriberCount,
  };
}

