'use client';

interface AgeGroup {
  age: string;
  percentage: number;
  color: string;
}

const ageGroups: AgeGroup[] = [
  { age: '10', percentage: 58, color: '#ff8953' },
  { age: '20', percentage: 24, color: '#d4731a' },
  { age: '30', percentage: 12, color: '#a85a14' },
  { age: '40+', percentage: 6, color: '#7d420f' }
];

export default function AgeChart() {
  return (
    <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-[20px] p-6">
      <div className="space-y-10">
        <h3 className="text-white text-base font-normal">시청자 연령 층</h3>
        
        <div className="space-y-6">
          {/* 차트 바 */}
          <div className="flex items-end h-8 gap-1">
            {ageGroups.map((group, index) => (
              <div key={group.age} className="flex flex-col items-start" style={{ width: `${group.percentage}%` }}>
                <span className="text-[#e2e2e4] text-sm opacity-60 mb-2">
                  {group.percentage}%
                </span>
                <div 
                  className="w-full rounded-md"
                  style={{
                    backgroundColor: group.color,
                    height: '32px'
                  }}
                />
              </div>
            ))}
          </div>
          
          {/* 범례 */}
          <div className="flex items-center gap-4">
            {ageGroups.map((group, index) => (
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
      </div>
    </div>
  );
}
