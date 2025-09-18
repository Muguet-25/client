'use client';

interface NavigationItem {
  name: string;
  href: string;
  active?: boolean;
}

const navigationItems: NavigationItem[] = [
  { name: '대시보드', href: '/dashboard', active: true },
  { name: '포스팅 추천', href: '/posts', active: false },
  { name: '분석하기', href: '/analytics', active: false },
  { name: '시청 개요', href: '/youtube', active: false }
];

export default function DashboardNavigation() {
  return (
    <div className="bg-[#12121e] border-b border-[#696969] px-6 py-4">
      <nav className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center space-x-8">
          {navigationItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`text-lg font-normal transition-colors ${
                item.active 
                  ? 'text-[#ff8953]' 
                  : 'text-white hover:text-[#ff8953]'
              }`}
            >
              {item.name}
            </a>
          ))}
        </div>
      </nav>
    </div>
  );
}
