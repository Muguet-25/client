"use client";

import { ResponsiveLine } from "@nivo/line";
import { linearGradientDef } from "@nivo/core";

interface SubscriberChartProps {
  subscriberCount?: number;
}

export default function SubscriberChart({ subscriberCount = 0 }: SubscriberChartProps) {
  // 서비스 시작일: 2025년 11월
  const serviceStartYear = 2025;
  const serviceStartMonth = 11; // 11월
  
  // 현재 날짜
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12
  
  // 서비스 시작일부터 현재까지의 개월 수 계산
  const monthsSinceStart = (currentYear - serviceStartYear) * 12 + (currentMonth - serviceStartMonth) + 1;
  
  // 월 레이블 생성 함수
  const generateMonthLabel = (monthOffset: number): string => {
    let year = serviceStartYear;
    let month = serviceStartMonth + monthOffset;
    
    // 년도 조정
    while (month > 12) {
      month -= 12;
      year += 1;
    }
    while (month < 1) {
      month += 12;
      year -= 1;
    }
    
    return `${year}-${String(month).padStart(2, '0')}`;
  };

  // 서비스 시작일(11월)부터 현재까지의 데이터 생성
  const dataPoints = [];
  for (let i = 0; i < monthsSinceStart; i++) {
    const monthLabel = generateMonthLabel(i);
    
    // 첫 달(11월)은 초기 구독자 수로 시작, 이후 점진적 증가
    let estimatedCount;
    if (i === 0) {
      estimatedCount = Math.max(0, subscriberCount - (subscriberCount * 0.8)); // 첫 달은 20% 수준
    } else {
      // 선형 증가 추정
      const progress = i / (monthsSinceStart - 1);
      estimatedCount = Math.max(0, Math.round(subscriberCount * (0.2 + progress * 0.8)));
    }
    
    dataPoints.push({ x: monthLabel, y: estimatedCount });
  }
  
  // 마지막 데이터는 현재 구독자 수로 설정
  if (dataPoints.length > 0) {
    dataPoints[dataPoints.length - 1].y = subscriberCount;
  }

  const data = [
    {
      id: "구독자 수",
      data: dataPoints,
    },
  ];

  const minValue = data[0]?.data.length > 0
    ? Math.min(...data[0].data.map((d) => d.y))
    : 0;

  const formattedCount = subscriberCount.toLocaleString();

  return (
    <div
      style={{
        height: "400px",
        width: "100%",
        background: "#1c1c28",
        borderRadius: "20px",
        border: "1px solid #3a3b50",
        padding: "20px",
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 제목 + 숫자 */}
      <h3 className="text-white text-base font-normal mb-2">구독자 수</h3>
      <span className="text-white text-5xl font-bold mb-4">{formattedCount}</span>

      {/* 그래프 영역 */}
      <div style={{ flex: 1 }}>
        <ResponsiveLine
          data={data}
          margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
          xScale={{ type: "point" }}
          yScale={{
            type: "linear",
            min: minValue,
            max: "auto",
            stacked: false,
            reverse: false,
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 0,
            tickPadding: 15,
            tickRotation: 0,
            format: (v) => v.replace("2025-", "") + "월",
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 10,
            tickRotation: 0,
            tickValues: 5,
          }}
          enablePoints={false}
          enableGridX={false}
          enableGridY={true}
          lineWidth={2}
          colors={["#FF8953"]}
          enableArea={true}
          areaBaselineValue={minValue}
          areaOpacity={1}
          useMesh={true}
          defs={[
            linearGradientDef("lineGradient", [
              { offset: 0, color: "#FF8953", opacity: 0.5 }, // 위쪽
              { offset: 100, color: "#FF8953", opacity: 0 }, // 아래쪽 투명
            ]),
          ]}
          fill={[{ match: "*", id: "lineGradient" }]}
          tooltip={({ point }) => (
            <div
              style={{
                background: "#1c1c28",
                padding: "4px 8px",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "12px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              }}
            >
              <div>{point.data.xFormatted}</div>
              <div>{point.data.yFormatted}명</div>
            </div>
          )}
          theme={{
            background: "#1c1c28",
            text: { fill: "#aaa" },
            axis: {
              ticks: { text: { fill: "#aaa" } },
            },
            grid: {
              line: { stroke: "#333", strokeWidth: "1px" },
            },
          }}
        />
      </div>
    </div>
  );
}