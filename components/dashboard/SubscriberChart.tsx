'use client';

interface ChartPoint {
  date: string;
  value: number;
  x: number;
  y: number;
}

const chartData: ChartPoint[] = [
  { date: '2025-06-18', value: 194069, x: 400, y: 50 }
];

const months = ['5월', '6월', '7월', '8월', '9월', '10월'];
const yAxisLabels = ['25.', '20.', '15.', '10.', '5.'];

export default function SubscriberChart() {
  return (
    <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-[20px] p-6">
      <div className="space-y-6">
        {/* 구독자 수 헤더 */}
        <div className="flex flex-col space-y-4">
          <h3 className="text-white text-base font-normal">구독자 수</h3>
          
          <div className="space-y-4">
            <div className="text-[#e2e2e4] text-5xl font-bold leading-[54px]">
              251,012
            </div>
            
            {/*
            
            
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm bg-[#ff8953] bg-opacity-40 text-[#ff8953]">
              <span className="material-symbols-rounded text-lg">stat_1</span>
              <span>12%</span>
            </div>
            */}
          </div>
        </div>

        {/* 차트 영역 */}
        <div className="relative">
          {/* Y축 라벨 */}
          <div className="absolute left-0 top-0 h-72 flex flex-col justify-between text-white opacity-40 text-xs">
            {yAxisLabels.map((label, index) => (
              <span key={index}>{label}</span>
            ))}
          </div>

          {/* 차트 그리드와 그래프 */}
          <div className="ml-6 relative">
            {/* 그리드 라인들 */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="w-full h-px bg-[#929bad] opacity-20" />
              ))}
            </div>

            {/* 차트 영역 */}
            <div className="h-72 relative">
              {/* 데이터 포인트 */}
              {chartData.map((point, index) => (
                <div key={index} className="absolute" style={{ left: `${point.x}px`, top: `${point.y}px` }}>
                  {/* 툴팁 */}
                  {/*
                    <div className="absolute -top-16 -left-11 bg-[#12121e] border border-[#3a3b50] rounded-lg p-3 text-xs">
                    <div className="text-white opacity-40 mb-1">{point.date}</div>
                    <div className="text-[#e2e2e4] font-medium">{point.value.toLocaleString()}</div>
                  </div>
                  */}
                  
                  
                  {/* 데이터 포인트 */}
                  {/*
                    <div className="w-2.5 h-2.5 bg-[#ffd9a3] border-2 border-[#ff8953] rounded-full" />
                  */}
                  
                </div>
              ))}
            </div>

            {/* X축 라벨 */}
            <div className="flex justify-between text-white opacity-40 text-xs mt-2">
              {months.map((month, index) => (
                <span key={index}>{month}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
