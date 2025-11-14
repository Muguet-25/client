'use client';


interface StatsCardProps {
  title: string;
  value: string;
  icon?: string;
  className?: string;
}

export default function StatsCard({ title, value, icon, className }: StatsCardProps) {
  return (
    <div className={`bg-[#1c1c28] border border-[#3a3b50] rounded-[20px] p-6 h-full flex flex-col justify-center ${className || ''}`}>
      <div className="text-left">
        <h3 className="text-white text-base font-normal mb-4">{title}</h3>
        <div className="text-[#e2e2e4] text-5xl font-bold leading-[54px]">
          {value}
        </div>
      </div>
    </div>
  );
}
