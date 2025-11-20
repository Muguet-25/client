'use client';

import { useMemo } from 'react';
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

interface AgeChartProps {
  ageGroupData?: YouTubeAgeGroupData[];
  isLoading?: boolean;
}

export default function AgeChart({ ageGroupData = [], isLoading = false }: AgeChartProps) {
  // 데이터를 우리 형식으로 변환 (useMemo로 최적화)
  const ageGroups = useMemo(() => {
    if (!ageGroupData || ageGroupData.length === 0) {
      return defaultAgeGroups;
    }

    return defaultAgeGroups.map(defaultGroup => {
      const found = ageGroupData.find(d => d.ageGroup === defaultGroup.age);
      return {
        age: defaultGroup.age,
        percentage: found ? found.percentage : 0,
        color: defaultGroup.color,
      };
    });
  }, [ageGroupData]);

  // 총 퍼센트 계산 (정규화를 위해)
  const totalPercentage = ageGroups.reduce((sum, group) => sum + group.percentage, 0);
  const normalizedGroups = totalPercentage > 0 
    ? ageGroups.map(group => ({
        ...group,
        percentage: (group.percentage / totalPercentage) * 100,
      }))
    : ageGroups;

  const activeGroups = normalizedGroups.filter((group) => group.percentage > 0);

  return (
    <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-[20px] p-6 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-white text-base font-normal mb-4">시청자 연령 층</h3>
        {isLoading ? (
          <div className="flex h-24 items-center justify-center rounded-lg bg-[#1f1f2d] text-[#aaaaaa] text-sm">
            데이터를 불러오는 중...
          </div>
        ) : (
          <div className="space-y-6">
            {/* 차트 바 */}
            <div className="flex items-end gap-2">
              {activeGroups.map((group) => (
                <div 
                  key={group.age} 
                  className="flex flex-1 flex-col items-start"
                  style={{ width: `${group.percentage}%` }}
                >
                  {group.percentage > 0 && (
                    <>
                      <span className="text-[#e2e2e4] text-xs opacity-60 mb-2">
                        {group.percentage.toFixed(1)}%
                      </span>
                      <div 
                        className="w-full rounded-md"
                        style={{
                          backgroundColor: group.color,
                          height: '24px'
                        }}
                      />
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* 범례 */}
            <div className="flex flex-wrap items-center gap-3">
              {normalizedGroups.map((group) => (
                <div key={group.age} className="flex items-center gap-1.5">
                  <div 
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{
                      backgroundColor: group.color
                    }}
                  />
                  <span className="text-[#e2e2e4] text-xs opacity-60">
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
