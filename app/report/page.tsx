'use client';

import DashboardNavigation from '@/components/dashboard/Navigation';
import ReportHeader from '@/components/report/ReportHeader';
import Calendar from '@/components/report/Calendar';

// 샘플 데이터
const sampleEvents = [
  {
    id: '1',
    title: '영상 제목 1',
    date: new Date(2024, 9, 16), // 10월 16일
    thumbnail: '/img/고양이.jpg',
    views: 1250,
    duration: '5:30'
  },
  {
    id: '2',
    title: '영상 제목 2',
    date: new Date(2024, 9, 16), // 10월 16일
    thumbnail: '/img/고양이.jpg',
    views: 890,
    duration: '3:45'
  },
  {
    id: '3',
    title: '영상 제목 3',
    date: new Date(2024, 9, 16), // 10월 16일
    thumbnail: '/img/고양이.jpg',
    views: 2100,
    duration: '7:20'
  },
  {
    id: '4',
    title: '영상 제목 4',
    date: new Date(2024, 9, 21), // 10월 21일
    thumbnail: '/img/고양이.jpg',
    views: 1560,
    duration: '4:15'
  }
];

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-[#12121E] relative">
      {/* 네비게이션 */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <DashboardNavigation />
      </div>
      
      <ReportHeader />
      <Calendar events={sampleEvents} />
    </div>
  );
}
