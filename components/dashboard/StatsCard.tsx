'use client';


interface StatsCardProps {
  title: string;
  value: string;
  changePercent: string;
  changeType: 'increase' | 'decrease';
  icon?: string;
}

export default function StatsCard({ title, value, changePercent, changeType, icon }: StatsCardProps) {
  return (
    <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-[20px] p-6 h-full">
      <div className="space-y-10">
        <div className="flex flex-col space-y-1">
          <h3 className="text-white text-base font-normal">{title}</h3>

          <div className="space-y-6">
            <div className="text-[#e2e2e4] text-5xl font-bold leading-[54px]">
              {value}
            </div>


            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-sm ${changeType === 'increase'
                ? 'bg-[#ff8953]/80  text-white'
                : 'bg-[#0065ff]/80 text-white'
              }`}>


              <span className="material-symbols-rounded text-lg">
                {changeType === 'increase' ? '' : '' }
              </span>
              <span>{changePercent}</span>
              </div>

              


            </div>
          </div>
        </div>
      </div>
      );
}
