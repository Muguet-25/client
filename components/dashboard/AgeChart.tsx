'use client';

import { useState, useEffect } from 'react';
import { useYouTube } from '@/hooks/useYouTube';
import { YouTubeAgeGroupData } from '@/lib/youtube/types';

interface AgeGroup {
  age: string;
  percentage: number;
  color: string;
}

const ageColors: Record<string, string> = {
  '10': '#ff8953',
  '20': '#d4731a',
  '30': '#a85a14',
  '40+': '#7d420f',
};

// 기본 데이터 (데이터가 없을 때 사용)
const defaultAgeGroups: AgeGroup[] = [
  { age: '10', percentage: 0, color: '#ff8953' },
  { age: '20', percentage: 0, color: '#d4731a' },
  { age: '30', percentage: 0, color: '#a85a14' },
  { age: '40+', percentage: 0, color: '#7d420f' },
];

export default function AgeChart() {
  const { channel, isConnected, getAgeGroupData } = useYouTube();
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>(defaultAgeGroups);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAgeGroupData = async () => {
      if (!isConnected || !channel) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // 최근 30일 데이터 가져오기
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        const data = await getAgeGroupData(channel.id, startDateStr, endDateStr);
        
        if (data && data.length > 0) {
          // 데이터를 우리 형식으로 변환
          const transformedData: AgeGroup[] = defaultAgeGroups.map(defaultGroup => {
            const found = data.find(d => d.ageGroup === defaultGroup.age);
            return {
              age: defaultGroup.age,
              percentage: found ? found.percentage : 0,
              color: defaultGroup.color,
            };
          });
          
          setAgeGroups(transformedData);
        } else {
          // 데이터가 없으면 기본값 사용
          setAgeGroups(defaultAgeGroups);
        }
      } catch (error) {
        console.error('연령대 데이터 가져오기 실패:', error);
        setAgeGroups(defaultAgeGroups);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgeGroupData();
  }, [isConnected, channel, getAgeGroupData]);

  // 총 퍼센트 계산 (정규화를 위해)
  const totalPercentage = ageGroups.reduce((sum, group) => sum + group.percentage, 0);
  const normalizedGroups = totalPercentage > 0 
    ? ageGroups.map(group => ({
        ...group,
        percentage: (group.percentage / totalPercentage) * 100,
      }))
    : ageGroups;

  return (
    <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-[20px] p-6">
      <div className="space-y-10">
        <h3 className="text-white text-base font-normal">시청자 연령 층</h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-[#aaaaaa] text-sm">데이터를 불러오는 중...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 차트 바 */}
            <div className="flex items-end h-8 gap-1">
              {normalizedGroups.map((group) => (
                <div 
                  key={group.age} 
                  className="flex flex-col items-start" 
                  style={{ width: `${group.percentage}%` }}
                >
                  {group.percentage > 0 && (
                    <>
                      <span className="text-[#e2e2e4] text-sm opacity-60 mb-2">
                        {group.percentage.toFixed(1)}%
                      </span>
                      <div 
                        className="w-full rounded-md"
                        style={{
                          backgroundColor: group.color,
                          height: '32px'
                        }}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
            
            {/* 범례 */}
            <div className="flex items-center gap-4">
              {normalizedGroups.map((group) => (
                <div key={group.age} className="flex items-center space-x-1">
                  <div 
                    className="w-2 h-2 rounded-md"
                    style={{
                      backgroundColor: group.color
                    }}
                  />
                  <span className="text-[#e2e2e4] text-sm opacity-60">
                    {group.age}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
