"use client";

import { ResponsiveLine } from "@nivo/line";
import { linearGradientDef } from "@nivo/core";

const data = [
  {
    id: "구독자 수",
    data: [
      { x: "2025-05", y: 100000 },
      { x: "2025-06", y: 194069 },
      { x: "2025-07", y: 180000 },
      { x: "2025-08", y: 210000 },
      { x: "2025-09", y: 230000 },
      { x: "2025-10", y: 251012 },
    ],
  },
];

const minValue = Math.min(
  ...data[0].data.map((d) => d.y)  // 모든 y 값 중 최소
);

export default function SubscriberChart() {
  return (
    <div
      style={{
        height: "400px",
        width: "100%",
        background: "#1c1c28",
        borderRadius: "12px",
        border: "1px solid #3a3b50",
        padding: "20px",
        marginBottom: "20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 제목 + 숫자 */}
      <h3 className="text-white text-base font-normal mb-2">구독자 수</h3>
      <span className="text-white text-5xl font-bold mb-4">251,012</span>

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