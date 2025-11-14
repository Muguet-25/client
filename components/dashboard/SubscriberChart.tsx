"use client";

interface SubscriberSummaryProps {
  subscriberCount?: number;
  changePercent?: number | null;
}

export default function SubscriberChart({
  subscriberCount = 0,
  changePercent = null,
}: SubscriberSummaryProps) {
  const formattedCount = subscriberCount.toLocaleString("ko-KR");
  const hasChange = typeof changePercent === "number" && !Number.isNaN(changePercent);
  const isIncrease = (changePercent ?? 0) >= 0;

  return (
    <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-[20px] p-6 h-full flex flex-col justify-between">
      <div>
        <h3 className="text-white text-base font-normal mb-4">총 구독자 수</h3>
        <div className="text-[#e2e2e4] text-5xl font-bold leading-[54px]">
          {formattedCount}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-4 text-sm">
        {hasChange ? (
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border ${
              isIncrease
                ? "border-[#ff8953]/50 bg-[#ff8953]/10 text-[#ff8953]"
                : "border-[#f87171]/40 bg-[#f87171]/10 text-[#f87171]"
            }`}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isIncrease ? (
                <path d="M12 5v14m0 0l-6-6m6 6l6-6" />
              ) : (
                <path d="M12 19V5m0 0l6 6m-6-6l-6 6" />
              )}
            </svg>
            {Math.abs(changePercent!).toLocaleString("ko-KR", {
              maximumFractionDigits: 1,
            })}
            %
          </span>
        ) : null}

        
      </div>
    </div>
  );
}