'use client';

import { useState } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  thumbnail?: string;
  views?: number;
  duration?: string;
  likes?: number;
  publishedAt: string;
  performance?: 'high' | 'medium' | 'low'; // 성과 지표
  avgViews?: number; // 평균 조회수 (비교용)
}

interface CalendarProps {
  events?: CalendarEvent[];
  onVideoClick?: (video: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

export default function Calendar({ events = [], onVideoClick, onDateClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];
  
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // 이전 달의 마지막 날들
    const prevMonth = new Date(year, month, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isToday: false,
        fullDate: new Date(year, month - 1, prevMonth.getDate() - i)
      });
    }
    
    // 현재 달의 날들
    for (let day = 1; day <= daysInMonth; day++) {
      const fullDate = new Date(year, month, day);
      const isToday = fullDate.toDateString() === new Date().toDateString();
      days.push({
        date: day,
        isCurrentMonth: true,
        isToday,
        fullDate
      });
    }
    
    // 다음 달의 첫 날들
    const remainingDays = 42 - days.length; // 6주 * 7일 = 42
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        date: day,
        isCurrentMonth: false,
        isToday: false,
        fullDate: new Date(year, month + 1, day)
      });
    }
    
    return days;
  };
  
  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  // 성과에 따른 색상 결정
  const getPerformanceColor = (performance?: 'high' | 'medium' | 'low') => {
    if (!performance) return 'border-[#3a3b50]';
    switch (performance) {
      case 'high':
        return 'border-green-500/50 bg-green-500/10';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low':
        return 'border-red-500/50 bg-red-500/10';
      default:
        return 'border-[#3a3b50]';
    }
  };

  const getPerformanceBadge = (performance?: 'high' | 'medium' | 'low') => {
    if (!performance) return null;
    switch (performance) {
      case 'high':
        return <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" />;
      case 'medium':
        return <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-500 rounded-full" />;
      case 'low':
        return <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />;
      default:
        return null;
    }
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };
  
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  const days = getDaysInMonth(currentDate);
  
  return (
    <div className="w-full">
      {/* 캘린더 헤더 */}
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">
            {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
          </h2>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="w-8 h-8 flex items-center justify-center border border-[#3a3b50] rounded-lg text-[#f5f5f5] hover:bg-[#3a3b50] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
              </svg>
            </button>
            
          
            
            <button
              onClick={() => navigateMonth('next')}
              className="w-8 h-8 flex items-center justify-center border border-[#3a3b50] rounded-lg text-[#f5f5f5] hover:bg-[#3a3b50] transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
              </svg>
            </button>
          </div>
        </div>
        
        {/* 요일 헤더 */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {dayNames.map((day, index) => (
            <div
              key={day}
              className={`text-center py-2 text-base font-normal ${
                index === 0 || index === 6 
                  ? 'text-[#f5f5f5]/80' 
                  : 'text-[#f5f5f5]'
              }`}
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* 캘린더 그리드 */}
        <div className="grid grid-cols-7 gap-0 border border-[#3a3b50] rounded-lg overflow-hidden">
          {days.map((day, index) => {
            const dayEvents = getEventsForDate(day.fullDate);
            const isWeekend = index % 7 === 0 || index % 7 === 6;
            
            return (
              <div
                key={index}
                className={`min-h-[112px] p-2 border-r border-b border-[#3a3b50] last:border-r-0 ${
                  day.isCurrentMonth 
                    ? day.isToday 
                      ? 'bg-[#26273c] border-2 border-white' 
                      : 'bg-[#1c1c28]'
                    : 'bg-[#26273c]'
                }`}
              >
                <div className="flex flex-col h-full">
                  <div 
                    className={`text-sm mb-1 ${
                      day.isCurrentMonth 
                        ? 'text-[#f5f5f5]' 
                        : 'text-[#f5f5f5]/60'
                    } ${onDateClick && day.isCurrentMonth && day.fullDate >= new Date(new Date().setHours(0, 0, 0, 0)) ? 'cursor-pointer hover:text-[#ff8953]' : ''}`}
                    onClick={() => {
                      if (onDateClick && day.isCurrentMonth && day.fullDate >= new Date(new Date().setHours(0, 0, 0, 0))) {
                        onDateClick(day.fullDate);
                      }
                    }}
                  >
                    {day.date}일
                  </div>
                  
                  {/* 이벤트 표시 */}
                  <div className="flex-1 flex flex-col gap-1">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={event.id}
                        className={`relative group cursor-pointer ${getPerformanceColor(event.performance)}`}
                        onClick={() => onVideoClick?.(event)}
                        title={event.performance ? 
                          `성과: ${event.performance === 'high' ? '높음' : event.performance === 'medium' ? '보통' : '낮음'}` : 
                          event.title
                        }
                      >
                        {event.thumbnail ? (
                          <div className="relative">
                            <img
                              src={event.thumbnail}
                              alt={event.title}
                              className="w-full h-16 object-cover rounded border-2"
                            />
                            {getPerformanceBadge(event.performance)}
                            <div className="absolute inset-0 bg-black/40 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="text-white text-xs font-medium text-center px-1">
                                <div className="mb-1">{event.title}</div>
                                {event.views && event.avgViews && (
                                  <div className="text-[10px]">
                                    조회수: {event.views.toLocaleString()}
                                    {event.performance === 'high' && ' ↑'}
                                    {event.performance === 'low' && ' ↓'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className={`${event.isPlanned ? 'bg-blue-500/20 border-blue-500/50' : 'bg-[#ff8953]/20 border-[#ff8953]/40'} border-2 rounded px-2 py-1 relative ${getPerformanceColor(event.performance)}`}>
                            {getPerformanceBadge(event.performance)}
                            {event.isPlanned && (
                              <span className="absolute top-1 left-1 w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                            <span className={`${event.isPlanned ? 'text-blue-400' : 'text-[#ff8953]'} text-xs font-medium truncate block`}>
                              {event.title}
                            </span>
                            {event.status && (
                              <span className="text-[10px] text-[#aaaaaa] block mt-0.5">
                                {event.status === 'idea' ? '💡 아이디어' : 
                                 event.status === 'planned' ? '📅 계획됨' : 
                                 '🎬 제작 중'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {dayEvents.length > 3 && (
                      <div className="text-[#f5f5f5]/60 text-xs">
                        +{dayEvents.length - 3}개 더
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
    </div>
  );
}
