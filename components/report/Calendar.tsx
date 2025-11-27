'use client';

import { Calendar as CalendarIcon, Clock, FileText, X, Trash2 } from 'lucide-react';
import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/utils/config';
import { useAuthStore } from '@/lib/useAuthStore';

interface CalendarEvent {
  id: string
  title: string;
  date: Date;
  thumbnail?: string;
  views?: number;
  duration?: string;
  likes?: number;
  publishedAt: string;
  performance?: 'high' | 'medium' | 'low'; // 성과 지표
  avgViews?: number; // 평균 조회수 (비교용)
  isPlanned?: boolean; // 예정된 콘텐츠 여부
  status?: 'idea' | 'planned' | 'in_progress'; // 진행 상태
  scheduledTime?: string; // 예약 시간 (HH:mm)
  notes?: string; // 메모
}

interface CalendarProps {
  events?: CalendarEvent[];
  onVideoClick?: (video: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
}

export default function Calendar({ events = [], onVideoClick, onDateClick }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('10:00');
  const [newEventNotes, setNewEventNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement | null>(null);
  const timePickerRef = useRef<HTMLDivElement | null>(null);
  const [datePickerView, setDatePickerView] = useState<{ year: number; month: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  const mergedEvents = useMemo(() => {
    if (customEvents.length === 0) return events;
    return [...events, ...customEvents];
  }, [events, customEvents]);

  const today = new Date(new Date().setHours(0, 0, 0, 0));

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
    return mergedEvents.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getTodayDateString = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const resetForm = () => {
    setNewEventTitle('');
    setNewEventDate('');
    setNewEventTime('10:00');
    setNewEventNotes('');
    setFormError(null);
    setIsDatePickerOpen(false);
    setIsTimePickerOpen(false);
    setDatePickerView(null);
  };

  // Supabase에서 일정 불러오기
  const loadEvents = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;

      if (data) {
        const loadedEvents: CalendarEvent[] = data.map((item) => ({
          id: item.id,
          title: item.title,
          date: new Date(item.date),
          publishedAt: item.date,
          isPlanned: true,
          scheduledTime: item.scheduled_time || undefined,
          notes: item.notes || undefined,
        }));
        setCustomEvents(loadedEvents);
      }
    } catch (error) {
      console.error('일정 불러오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // 컴포넌트 마운트 시 일정 불러오기
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const formatDisplayTime = (time: string) => {
    if (!time) return '시간 선택';
    const [hourStr, minuteStr] = time.split(':');
    const hour = Number(hourStr);
    const period = hour < 12 ? '오전' : '오후';
    const displayHour = ((hour + 11) % 12) + 1;
    return `${period} ${displayHour}:${minuteStr}`;
  };

  const updateScheduleTime = (hour: number, minute: number) => {
    const formatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    setNewEventTime(formatted);
  };

  const parseDateString = (dateStr: string): Date => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCalendarMatrix = (baseDate: { year: number; month: number }) => {
    const firstDay = new Date(baseDate.year, baseDate.month, 1);
    const startDayOfWeek = firstDay.getDay(); // 0 (Sun) - 6 (Sat)
    const daysInMonth = new Date(baseDate.year, baseDate.month + 1, 0).getDate();
    const prevMonthDays = new Date(baseDate.year, baseDate.month, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weeks: Array<
      Array<{
        date: Date;
        isCurrentMonth: boolean;
        isToday: boolean;
        isDisabled: boolean;
      }>
    > = [];

    let dayCounter = 1;
    let nextMonthDay = 1;
    let started = false;

    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let day = 0; day < 7; day++) {
        let currentDate: Date;
        let isCurrentMonth = false;

        if (!started && day === startDayOfWeek) {
          started = true;
        }

        if (!started) {
          const prevDay = prevMonthDays - (startDayOfWeek - day - 1);
          currentDate = new Date(baseDate.year, baseDate.month - 1, prevDay);
        } else if (dayCounter <= daysInMonth) {
          currentDate = new Date(baseDate.year, baseDate.month, dayCounter);
          dayCounter++;
          isCurrentMonth = true;
        } else {
          currentDate = new Date(baseDate.year, baseDate.month + 1, nextMonthDay);
          nextMonthDay++;
        }

        const dateCopy = new Date(currentDate);
        dateCopy.setHours(0, 0, 0, 0);

        weekDays.push({
          date: currentDate,
          isCurrentMonth,
          isToday: dateCopy.getTime() === today.getTime(),
          isDisabled: dateCopy.getTime() < today.getTime(),
        });
      }
      weeks.push(weekDays);
    }

    return weeks;
  };

  const handleCreateEvent = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newEventTitle.trim() || !newEventDate) {
      setFormError('제목과 날짜를 모두 입력해주세요.');
      return;
    }

    if (!user?.id) {
      setFormError('로그인이 필요합니다.');
      return;
    }

    const selectedDate = new Date(`${newEventDate}T${newEventTime || '00:00'}`);
    if (Number.isNaN(selectedDate.getTime())) {
      setFormError('유효한 날짜를 선택해주세요.');
      return;
    }

    const eventId = `custom-${Date.now()}`;
    const newEvent: CalendarEvent = {
      id: eventId,
      title: newEventTitle.trim(),
      date: selectedDate,
      publishedAt: selectedDate.toISOString(),
      isPlanned: true,
      scheduledTime: newEventTime,
      notes: newEventNotes.trim() || undefined,
    };

    try {
      // Supabase에 저장
      const { error } = await supabase
        .from('calendar_events')
        .insert({
          id: eventId,
          user_id: user.id,
          title: newEvent.title,
          date: selectedDate.toISOString(),
          scheduled_time: newEventTime,
          notes: newEventNotes.trim() || null,
        });

      if (error) throw error;

      setCustomEvents(prev => [...prev, newEvent]);
      resetForm();
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('일정 저장 실패:', error);
      setFormError('일정 저장에 실패했습니다.');
    }
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

  const handleEventClick = (event: CalendarEvent) => {
    if (event.isPlanned) {
      setSelectedEvent(event);
      setIsDetailModalOpen(true);
      return;
    }
    onVideoClick?.(event);
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent || !user?.id) return;
    
    try {
      // Supabase에서 삭제
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', selectedEvent.id)
        .eq('user_id', user.id);

      if (error) throw error;

      // customEvents에서만 삭제 (외부에서 전달된 events는 삭제하지 않음)
      setCustomEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      setIsDetailModalOpen(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('일정 삭제 실패:', error);
      setFormError('일정 삭제에 실패했습니다.');
    }
  };

  const formatEventDateLabel = (date: Date) =>
    date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    });

  const getStatusLabel = (status?: 'idea' | 'planned' | 'in_progress') => {
    switch (status) {
      case 'idea':
        return '아이디어';
      case 'planned':
        return '계획됨';
      case 'in_progress':
        return '제작 중';
      default:
        return '미정';
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isTimePickerOpen &&
        timePickerRef.current &&
        !timePickerRef.current.contains(event.target as Node)
      ) {
        setIsTimePickerOpen(false);
      }
      if (
        isDatePickerOpen &&
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setIsDatePickerOpen(false);
      }
    };

    if (isTimePickerOpen || isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTimePickerOpen, isDatePickerOpen]);
  
  const days = getDaysInMonth(currentDate);
  
  return (
    <div className="w-full">
      {/* 캘린더 헤더 */}
      <div className="flex items-center justify-between mb-6 gap-4">
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
            <button
              onClick={() => {
                resetForm();
                setNewEventDate(getTodayDateString());
                setIsAddModalOpen(true);
              }}
              className="px-3 py-2 text-sm font-medium text-white border border-[#3a3b50] rounded-lg hover:bg-[#3a3b50] transition-colors"
            >
              일정 추가
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
                    } ${onDateClick && day.isCurrentMonth && day.fullDate >= today ? 'cursor-pointer hover:text-[#ff8953]' : ''}`}
                    onClick={() => {
                      if (onDateClick && day.isCurrentMonth && day.fullDate >= today) {
                        onDateClick(day.fullDate);
                      }
                    }}
                  >
                    {day.date}일
                  </div>
                  
                  {/* 이벤트 표시 */}
                  <div className="flex-1 flex flex-col gap-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`relative group cursor-pointer ${getPerformanceColor(event.performance)}`}
                        onClick={() => handleEventClick(event)}
                        title={
                          event.isPlanned
                            ? `${event.title} • ${event.scheduledTime ?? '시간 미정'}`
                            : event.performance
                              ? `성과: ${event.performance === 'high' ? '높음' : event.performance === 'medium' ? '보통' : '낮음'}`
                              : event.title
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
                           
                            <span className={`${event.isPlanned ? 'text-blue-400' : 'text-[#ff8953]'} text-xs font-medium truncate block`}>
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
      
      {/* 일정 추가 모달 */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => {
            resetForm();
            setIsAddModalOpen(false);
          }}
        >
          <div
            className="w-full max-w-[480px] rounded-3xl bg-[#1c1c28] border border-[#3a3b50] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#2c2d3f]">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#aaaaaa]">새 일정</p>
                <h3 className="text-xl font-semibold text-white mt-1">예약 콘텐츠 추가</h3>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(false);
                }}
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-[#aaaaaa]" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="px-6 py-6 space-y-5">
              <div>
                <label className="text-sm text-[#aaaaaa] mb-2 block">일정 제목</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="예: 신제품 발표 영상 촬영"
                  className="w-full rounded-2xl border border-[#3a3b50] bg-[#12121E] px-4 py-3 text-sm text-white placeholder:text-[#aaaaaa] focus:outline-none focus:border-[#ff8953]"
                />
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1" ref={datePickerRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDatePickerOpen((prev) => {
                        const next = !prev;
                        if (next) {
                          const base = newEventDate
                            ? parseDateString(newEventDate)
                            : parseDateString(getTodayDateString());
                          setDatePickerView({
                            year: base.getFullYear(),
                            month: base.getMonth(),
                          });
                          setIsTimePickerOpen(false);
                        }
                        return next;
                      });
                    }}
                    className="w-full bg-[#12121e] border border-[#3a3b50] rounded-[16px] px-6 py-4 text-left text-[#f5f5f5] focus:outline-none focus:border-[#ff8953] transition-colors hover:border-[#ff8953]/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[12px] text-[#f5f5f5]/40 uppercase tracking-wide mb-1">
                          날짜
                        </p>
                        <p className="text-[16px] font-medium text-[#f5f5f5]/80">
                          {newEventDate ? newEventDate.replace(/-/g, '. ') : '날짜 선택'}
                        </p>
                      </div>
                    </div>
                  </button>

                  {isDatePickerOpen && datePickerView && (
                    <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full rounded-[16px] border border-[#3a3b50] bg-[#1c1c28] p-4 shadow-xl">
                      <div className="mb-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() =>
                            setDatePickerView((prev) =>
                              prev
                                ? {
                                    year: prev.month === 0 ? prev.year - 1 : prev.year,
                                    month: prev.month === 0 ? 11 : prev.month - 1,
                                  }
                                : prev
                            )
                          }
                          className="rounded-full bg-[#26273c] px-3 py-1 text-sm text-[#f5f5f5]/70 hover:text-[#ff8953] transition-colors"
                        >
                          ←
                        </button>
                        <p className="text-[#f5f5f5]/80 text-sm font-semibold">
                          {datePickerView.year}년 {datePickerView.month + 1}월
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setDatePickerView((prev) =>
                              prev
                                ? {
                                    year: prev.month === 11 ? prev.year + 1 : prev.year,
                                    month: prev.month === 11 ? 0 : prev.month + 1,
                                  }
                                : prev
                            )
                          }
                          className="rounded-full bg-[#26273c] px-3 py-1 text-sm text-[#f5f5f5]/70 hover:text-[#ff8953] transition-colors"
                        >
                          →
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-2 text-center text-[#f5f5f5]/40 text-xs mb-2">
                        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                          <span key={day}>{day}</span>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {getCalendarMatrix(datePickerView).flat().map((cell, index) => {
                          const formatted = formatDateString(cell.date);
                          const isSelected = newEventDate === formatted;
                          return (
                            <button
                              key={`${formatted}-${index}`}
                              type="button"
                              disabled={cell.isDisabled}
                              onClick={() => {
                                setNewEventDate(formatted);
                                setIsDatePickerOpen(false);
                              }}
                              className={`h-10 rounded-[10px] text-sm transition-colors ${
                                cell.isDisabled
                                  ? 'cursor-not-allowed bg-transparent text-[#f5f5f5]/20'
                                  : cell.isCurrentMonth
                                    ? 'text-[#f5f5f5]/80 hover:bg-[#26273c]'
                                    : 'text-[#f5f5f5]/30 hover:bg-[#26273c]/50'
                              } ${
                                isSelected
                                  ? 'bg-[#ff8953]/20 text-[#ff8953]'
                                  : cell.isToday && !isSelected
                                    ? 'border border-dashed border-[#ff8953]/40'
                                    : ''
                              }`}
                            >
                              {cell.date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs text-[#f5f5f5]/40">
                        <span>오늘 이전 날짜는 선택할 수 없습니다.</span>
                        <button
                          type="button"
                          onClick={() => {
                            const today = parseDateString(getTodayDateString());
                            setNewEventDate(formatDateString(today));
                            setDatePickerView({
                              year: today.getFullYear(),
                              month: today.getMonth(),
                            });
                          }}
                          className="text-[#ff8953] hover:underline"
                        >
                          오늘로 이동
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="relative flex-1" ref={timePickerRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTimePickerOpen((prev) => {
                        const next = !prev;
                        if (next) {
                          setIsDatePickerOpen(false);
                        }
                        return next;
                      });
                    }}
                    className="w-full bg-[#12121e] border border-[#3a3b50] rounded-[16px] px-6 py-4 text-left text-[#f5f5f5] focus:outline-none focus:border-[#ff8953] transition-colors hover:border-[#ff8953]/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[12px] text-[#f5f5f5]/40 uppercase tracking-wide mb-1">
                          시간
                        </p>
                        <p className="text-[16px] font-medium text-[#f5f5f5]/80">
                          {formatDisplayTime(newEventTime)}
                        </p>
                      </div>
                    </div>
                  </button>

                  {isTimePickerOpen && (
                    <div className="absolute left-0 bottom-[calc(100%+8px)] z-50 w-full rounded-[16px] border border-[#3a3b50] bg-[#1c1c28] p-4 shadow-xl">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-[#f5f5f5]/70 text-sm">시간 선택</p>
                        <button
                          type="button"
                          onClick={() => setIsTimePickerOpen(false)}
                          className="text-[#f5f5f5]/40 hover:text-[#f5f5f5]/70 transition-colors text-sm"
                        >
                          닫기
                        </button>
                      </div>
                      <div className="grid grid-cols-[1fr_auto_1fr] gap-3">
                        <div className="max-h-40 overflow-y-auto rounded-[12px] border border-[#3a3b50]">
                          <ul>
                            {Array.from({ length: 24 }, (_, i) => i).map((hour) => {
                              const isActive =
                                newEventTime &&
                                Number(newEventTime.split(':')[0]) === hour;
                              return (
                                <li key={hour}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const minute = newEventTime
                                        ? Number(newEventTime.split(':')[1])
                                        : 0;
                                      updateScheduleTime(hour, minute);
                                    }}
                                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                      isActive
                                        ? 'bg-[#26273c] text-[#ff8953]'
                                        : 'text-[#f5f5f5]/70 hover:bg-[#26273c]/70'
                                    }`}
                                  >
                                    {`${String(hour).padStart(2, '0')} 시`}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                        <div className="flex items-center justify-center text-[#f5f5f5]/40 text-sm">
                          :
                        </div>
                        <div className="max-h-40 overflow-y-auto rounded-[12px] border border-[#3a3b50]">
                          <ul>
                            {[0, 10, 20, 30, 40, 50].map((minute) => {
                              const isActive =
                                newEventTime &&
                                Number(newEventTime.split(':')[1]) === minute;
                              return (
                                <li key={minute}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const hour = newEventTime
                                        ? Number(newEventTime.split(':')[0])
                                        : 0;
                                      updateScheduleTime(hour, minute);
                                    }}
                                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                      isActive
                                        ? 'bg-[#26273c] text-[#ff8953]'
                                        : 'text-[#f5f5f5]/70 hover:bg-[#26273c]/70'
                                    }`}
                                  >
                                    {`${String(minute).padStart(2, '0')} 분`}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-[#aaaaaa] mb-2 block flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  메모 (선택)
                </label>
                <textarea
                  value={newEventNotes}
                  onChange={(e) => setNewEventNotes(e.target.value)}
                  placeholder="캠페인 메시지, 협업 정보 등 메모를 남겨보세요."
                  className="w-full min-h-[96px] rounded-2xl border border-[#3a3b50] bg-[#12121E] px-4 py-3 text-sm text-white placeholder:text-[#aaaaaa] focus:outline-none focus:border-[#ff8953]"
                />
              </div>

              {formError && <p className="text-xs text-red-400">{formError}</p>}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setIsAddModalOpen(false);
                  }}
                  className="px-4 py-3 rounded-2xl border border-[#3a3b50] text-sm text-white hover:bg-white/5 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-2xl bg-[#ff8953] text-sm font-semibold text-white hover:bg-[#ff8953]/90 transition-colors"
                >
                  일정 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 일정 상세 모달 */}
      {isDetailModalOpen && selectedEvent && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4"
          onClick={() => {
            setIsDetailModalOpen(false);
            setSelectedEvent(null);
          }}
        >
          <div
            className="w-full max-w-[420px] rounded-[32px] bg-[#1c1c28] border border-[#2c2d3f] shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#8f90a6]">{formatEventDateLabel(selectedEvent.date)}</p>
                <h3 className="text-2xl font-semibold text-white mt-1">{selectedEvent.title}</h3>
              </div>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedEvent(null);
                }}
                className="p-2 rounded-full hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-[#aaaaaa]" />
              </button>
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-[#2c2d3f] pb-3">
                <span className="text-[#aaaaaa]">예약 시간</span>
                <span className="text-white font-medium">
                  {selectedEvent.scheduledTime ?? '시간 미정'}
                </span>
              </div>
              {selectedEvent.notes && (
                <div className="pt-1">
                  <span className="text-[#aaaaaa] block mb-2">메모</span>
                  <p className="text-white leading-relaxed whitespace-pre-line">{selectedEvent.notes}</p>
                </div>
              )}
            </div>

            {/* 삭제 버튼 */}
            {selectedEvent.isPlanned && customEvents.some(e => e.id === selectedEvent.id) && (
              <div className="mt-6 pt-6 border-t border-[#2c2d3f]">
                <button
                  onClick={handleDeleteEvent}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">예약 삭제</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
