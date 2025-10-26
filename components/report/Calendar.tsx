'use client';

import { useState } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  thumbnail?: string;
  views?: number;
  duration?: string;
}

interface CalendarProps {
  events?: CalendarEvent[];
}

export default function Calendar({ events = [] }: CalendarProps) {
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
    <div className="max-w-7xl mx-auto px-6 pt-8 pb-8">
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
                  <div className={`text-sm mb-1 ${
                    day.isCurrentMonth 
                      ? 'text-[#f5f5f5]' 
                      : 'text-[#f5f5f5]/60'
                  }`}>
                    {day.date}일
                  </div>
                  
                  {/* 이벤트 표시 */}
                  <div className="flex-1 flex flex-col gap-1">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={event.id}
                        className="relative group"
                      >
                        {event.thumbnail ? (
                          <div className="relative">
                            <img
                              src={event.thumbnail}
                              alt={event.title}
                              className="w-full h-16 object-cover rounded"
                            />
                            <div className="absolute inset-0 bg-black/40 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-white text-xs font-medium text-center px-1">
                                {event.title}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-[#ff8953]/20 border border-[#ff8953]/40 rounded px-2 py-1">
                            <span className="text-[#ff8953] text-xs font-medium truncate block">
                              {event.title}
                            </span>
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
