'use client';

interface ChartPoint {
  date: string;
  value: number;
  x: number;
  y: number;
}

const chartData: ChartPoint[] = [
  { date: '2025-05-01', value: 180000, x: 0, y: 42 },
  { date: '2025-06-01', value: 194069, x: 20, y: 28 },
  { date: '2025-07-01', value: 210000, x: 40, y: 21 },
  { date: '2025-08-01', value: 225000, x: 60, y: 14 },
  { date: '2025-09-01', value: 240000, x: 80, y: 7 },
  { date: '2025-10-01', value: 251012, x: 100, y: 3 }
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
              {/* SVG 차트 */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100% 100%" preserveAspectRatio="none">
                {/* 영역 채우기 */}
                <defs>
                  <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff8953" stopOpacity="0.3"/>
                    <stop offset="100%" stopColor="#ff8953" stopOpacity="0.05"/>
                  </linearGradient>
                </defs>
                
                {/* 영역 경로 */}
                <path
                  d={`M 0%,42% L 20%,28% L 40%,21% L 60%,14% L 80%,7% L 100%,3% L 100%,100% L 0%,100% Z`}
                  fill="url(#areaGradient)"
                />
                
                {/* 라인 경로 */}
                <path
                  d={`M 0%,42% L 20%,28% L 40%,21% L 60%,14% L 80%,7% L 100%,3%`}
                  stroke="#ff8953"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* 데이터 포인트들 */}
                {chartData.map((point, index) => (
                  <circle
                    key={index}
                      cx={`${point.x}%`}
                    cy={`${point.y}%` }
                    r="4"
                    fill="#ffd9a3"
                    stroke="#ff8953"
                    strokeWidth="2"
                  />
                ))}
              </svg>
              
            
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