'use client';

import { useState, useEffect, useRef, useId } from 'react';
import { X, CloudUpload, ArrowUp, Sun } from 'lucide-react';
import { WithContext as ReactTags } from 'react-tag-input';
import { useToast } from '@/hooks/useToast';

const KeyCodes = { comma: 188, enter: 13 };
const delimiters = [KeyCodes.comma, KeyCodes.enter];

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoUploadModal({ isOpen, onClose }: VideoUploadModalProps) {
  const getTodayDateString = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [tags, setTags] = useState<Array<{id: string, text: string}>>([]);
  const [category, setCategory] = useState('노하우, 스타일');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState(getTodayDateString()); // yyyy-mm-dd
  const [scheduleTime, setScheduleTime] = useState(''); // HH:MM
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const thumbnailInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputId = useId();
  const thumbnailInputId = useId();
  const [videoPosterUrl, setVideoPosterUrl] = useState<string | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const videoPosterUrlRef = useRef<string | null>(null);
  const thumbnailPreviewUrlRef = useRef<string | null>(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement | null>(null);
  const timePickerRef = useRef<HTMLDivElement | null>(null);
  const [datePickerView, setDatePickerView] = useState<{ year: number; month: number } | null>(null);

  const { success, error } = useToast();
  const getAccessToken = () => localStorage.getItem('youtube_access_token') || '';

  const resetForm = () => {
    setCurrentStep(1);
    setTitle('');
    setDescription('');
    setPrivacy('public');
    setTags([]);
    setCategory('노하우, 스타일');
    setVideoFile(null);
    setThumbnailFile(null);
    setIsUploading(false);
    setProgress(null);
    setScheduleEnabled(false);
    setScheduleDate(getTodayDateString());
    setScheduleTime('');
    if (videoPosterUrlRef.current) {
      URL.revokeObjectURL(videoPosterUrlRef.current);
      videoPosterUrlRef.current = null;
    }
    if (thumbnailPreviewUrlRef.current) {
      URL.revokeObjectURL(thumbnailPreviewUrlRef.current);
      thumbnailPreviewUrlRef.current = null;
    }
    setVideoPosterUrl(null);
    setThumbnailPreviewUrl(null);
    setIsDatePickerOpen(false);
    setIsTimePickerOpen(false);
    setDatePickerView(null);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (videoPosterUrlRef.current) {
        URL.revokeObjectURL(videoPosterUrlRef.current);
      }
      if (thumbnailPreviewUrlRef.current) {
        URL.revokeObjectURL(thumbnailPreviewUrlRef.current);
      }
    };
  }, []);

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
    setScheduleTime(formatted);
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

  const generatePosterFromVideo = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      const cleanup = () => {
        URL.revokeObjectURL(objectUrl);
      };

      const handleError = () => {
        cleanup();
        reject(new Error('동영상 정보를 불러오지 못했습니다.'));
      };

      video.onloadeddata = () => {
        if (!video.videoWidth || !video.videoHeight) {
          handleError();
          return;
        }
        const seekTime = Math.min(0.1, video.duration || 0);
        const handleSeeked = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext('2d');
          if (!context) {
            cleanup();
            reject(new Error('캔버스 컨텍스트를 생성하지 못했습니다.'));
            return;
          }
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            cleanup();
            if (blob) {
              const thumbnailUrl = URL.createObjectURL(blob);
              resolve(thumbnailUrl);
            } else {
              reject(new Error('썸네일 이미지를 생성하지 못했습니다.'));
            }
          }, 'image/png', 0.92);
        };

        video.currentTime = seekTime;
        video.onseeked = handleSeeked;
      };

      video.onerror = handleError;
    });
  };

  const isStep1Valid = Boolean(videoFile && title.trim() && description.trim());

  const uploadWithProgress = (url: string, file: File, headers: Record<string, string>, onProgress: (percent: number) => void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url);
      Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.floor((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.responseText || '{}');
        } else {
          reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText}`));
        }
      };
      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(file);
    });
  };

  const handleDelete = (i: number) => {
    setTags(tags.filter((tag, index) => index !== i));
  };

  const handleAddition = (tag: {id: string, text: string}) => {
    setTags([...tags, tag]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-[#1c1c28] border border-[#3a3b50] rounded-[20px] w-full max-w-[600px] max-h-[85vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-[#3a3b50]">
          <div className="flex items-center gap-3">
            <h2 className="text-[36px] font-bold text-[#f5f5f5]">예약하기</h2>
            <span className="text-[18px] font-semibold text-[#f5f5f5]/60">{currentStep}/2</span>
          </div>
          <button 
            onClick={onClose}
            className="text-[#f5f5f5]/60 hover:text-[#f5f5f5] transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="p-4 space-y-4">
          {currentStep === 1 ? (
            // 첫 번째 단계: 기본 정보
            <>
              {/* 파일 업로드 영역 */}
              <label
                htmlFor={videoInputId}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    videoInputRef.current?.click();
                  }
                }}
                className="group bg-[#12121e] border border-[#3a3b50] rounded-[16px] p-4 block cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff8953]/60"
              >
                <div className="flex flex-col items-center justify-center py-6">
                  {videoPosterUrl ? (
                    <div className="w-full max-w-[280px] aspect-video rounded-[12px] overflow-hidden border border-[#3a3b50] mb-4 shadow-lg">
                      <img
                        src={videoPosterUrl}
                        alt="업로드한 동영상 미리보기"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-[#26273c] rounded-[12px] w-[64px] h-[64px] flex items-center justify-center mb-3 transition-colors group-hover:text-[#ff8953]">
                      <CloudUpload className="w-12 h-12 text-[#f5f5f5]/60" />
                    </div>
                  )}
                  <div className="text-center pointer-events-none">
                    <p className="text-[18px] font-semibold text-[#f5f5f5]/60 mb-1">
                      여기에 동영상을 업로드 해주세요.
                    </p>
                    <p className="text-[14px] font-semibold text-[#f5f5f5]/40">
                      영상 최대 사이즈 256GB
                    </p>
                  </div>
                  <input
                    id={videoInputId}
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0] || null;
                      setVideoFile(file);

                      if (videoPosterUrlRef.current) {
                        URL.revokeObjectURL(videoPosterUrlRef.current);
                        videoPosterUrlRef.current = null;
                      }

                      if (file) {
                        try {
                          const posterUrl = await generatePosterFromVideo(file);
                          videoPosterUrlRef.current = posterUrl;
                          setVideoPosterUrl(posterUrl);
                        } catch (error) {
                          console.warn('동영상 썸네일 생성 실패:', error);
                          setVideoPosterUrl(null);
                        }
                      } else {
                        setVideoPosterUrl(null);
                      }
                    }}
                    className="hidden"
                  />
                  {videoFile && (
                    <p className="mt-4 text-[#f5f5f5]/60 text-sm text-center">
                      {videoFile.name}
                    </p>
                  )}
                </div>
              </label>

              {/* 영상 제목 */}
              <div>
                <label className="block text-[16px] text-[#f5f5f5]/60 mb-2">
                  영상 제목
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="영상 제목을 입력해주세요. (최대 100자)"
                    className="w-full bg-[#12121e] border border-[#3a3b50] rounded-[16px] px-6 py-4 text-[#f5f5f5] placeholder-[#f5f5f5]/60 focus:outline-none focus:border-[#ff8953]"
                    maxLength={100}
                  />
                  <span className="absolute right-6 top-4 text-[16px] text-[#f5f5f5]/60">
                    {title.length} / 100
                  </span>
                </div>
              </div>

              {/* 영상 설명 */}
              <div>
                <label className="block text-[16px] text-[#f5f5f5]/60 mb-2">
                  영상 설명
                </label>
                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="영상 설명을 입력해주세요. (최대 5000자)"
                    className="w-full bg-[#12121e] border border-[#3a3b50] rounded-[16px] px-6 py-4 text-[#f5f5f5] placeholder-[#f5f5f5]/60 focus:outline-none focus:border-[#ff8953] resize-none"
                    rows={6}
                    maxLength={5000}
                  />
                  <span className="absolute right-6 bottom-4 text-[16px] text-[#f5f5f5]/60">
                    {description.length} / 5000
                  </span>
                </div>
              </div>

              {/* 공개 범위 */}
              <div>
                <label className="block text-[16px] text-[#f5f5f5]/60 mb-2">
                  공개 범위
                </label>
                <div className="bg-[#12121e] border border-[#3a3b50] rounded-[16px] p-3">
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setPrivacy('public')}
                      className={`py-4 px-6 rounded-[12px] text-[18px] font-medium transition-colors ${
                        privacy === 'public'
                          ? 'bg-[#26273c] text-[#f5f5f5]/60'
                          : 'text-[#f5f5f5]/60 hover:bg-[#26273c]/50'
                      }`}
                    >
                      공개
                    </button>
                    <button
                      onClick={() => setPrivacy('unlisted')}
                      className={`py-4 px-6 rounded-[12px] text-[18px] font-medium transition-colors ${
                        privacy === 'unlisted'
                          ? 'bg-[#26273c] text-[#f5f5f5]/60'
                          : 'text-[#f5f5f5]/60 hover:bg-[#26273c]/50'
                      }`}
                    >
                      일부공개
                    </button>
                    <button
                      onClick={() => setPrivacy('private')}
                      className={`py-4 px-6 rounded-[12px] text-[18px] font-medium transition-colors ${
                        privacy === 'private'
                          ? 'bg-[#26273c] text-[#f5f5f5]/60'
                          : 'text-[#f5f5f5]/60 hover:bg-[#26273c]/50'
                      }`}
                    >
                      비공개
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // 두 번째 단계: 추가 설정
            <>
              {/* 썸네일 업로드 영역 */}
              <label
                htmlFor={thumbnailInputId}
                tabIndex={0}
                role="button"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    thumbnailInputRef.current?.click();
                  }
                }}
                className="group bg-[#12121e] border border-[#3a3b50] rounded-[16px] p-4 block cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#ff8953]/60"
              >
                <div className="flex flex-col items-center justify-center py-6">
                  {thumbnailPreviewUrl ? (
                    <div className="w-full max-w-[280px] aspect-video rounded-[12px] overflow-hidden border border-[#3a3b50] mb-4 shadow-lg">
                      <img
                        src={thumbnailPreviewUrl}
                        alt="업로드한 썸네일 미리보기"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="bg-[#26273c] rounded-[12px] w-[64px] h-[64px] flex items-center justify-center mb-3 transition-colors group-hover:text-[#ff8953]">
                      <ArrowUp className="w-12 h-12 text-[#f5f5f5]/60" />
                    </div>
                  )}
                  <div className="text-center pointer-events-none">
                    <p className="text-[18px] font-semibold text-[#f5f5f5]/60 mb-1">
                      여기에 동영상 썸네일을 업로드 해주세요.
                    </p>
                    <p className="text-[14px] font-semibold text-[#f5f5f5]/40">
                      JPG, PNG 형식의 2MB 이하 이미지 (최소 너비 640px)
                    </p>
                  </div>
                  <input
                    id={thumbnailInputId}
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setThumbnailFile(file);

                      if (thumbnailPreviewUrlRef.current) {
                        URL.revokeObjectURL(thumbnailPreviewUrlRef.current);
                        thumbnailPreviewUrlRef.current = null;
                      }

                      if (file) {
                        const objectUrl = URL.createObjectURL(file);
                        thumbnailPreviewUrlRef.current = objectUrl;
                        setThumbnailPreviewUrl(objectUrl);
                      } else {
                        setThumbnailPreviewUrl(null);
                      }
                    }}
                    className="hidden"
                  />
                  {thumbnailFile && (
                    <p className="mt-4 text-[#f5f5f5]/60 text-sm text-center">
                      {thumbnailFile.name}
                    </p>
                  )}
                </div>
              </label>

              {/* 태그 */}
              <div>
                <label className="block text-[16px] text-[#f5f5f5]/60 mb-2">
                  태그
                </label>
                <div className="bg-[#12121e] border border-[#3a3b50] rounded-[16px] px-6 py-4">
                  <ReactTags
                    tags={tags}
                    delimiters={delimiters}
                    handleDelete={handleDelete}
                    handleAddition={handleAddition}
                    placeholder="검색에 활용되는 태그 입니다 엔터로 구분해 입력해주세요."
                    classNames={{
                      tags: 'tags-container w-full',
                      tagInput: 'tag-input w-full',
                      tagInputField: 'tag-input-field',
                      selected: 'tag-selected w-full',
                      tag: 'tag',
                      remove: 'tag-remove'
                    }}
                  />
                </div>
              </div>

              {/* 카테고리 */}
              <div>
                <label className="block text-[16px] text-[#f5f5f5]/60 mb-2">
                  카테고리
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    '동물', '과학, 기술', '게임', '영화, 에니', '일상, 브이로그', '코미디',
                    '뉴스, 정치', '노하우, 스타일', '음악', '예능, 오락', '교육', '스포츠'
                  ].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`py-4 px-4 rounded-[16px] text-[16px] font-normal transition-colors ${
                        category === cat
                          ? 'bg-[#ff8953]/40 border border-[#ff8953]/40 text-[#ff8953]'
                          : 'bg-[#12121e] border border-[#3a3b50] text-[#f5f5f5]/60 hover:bg-[#26273c]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 업로드 예약일 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[16px] text-[#f5f5f5]/60">업로드 예약</label>
                  <label className="flex items-center gap-2 text-[#f5f5f5]/70">
                    <input
                      type="checkbox"
                      checked={scheduleEnabled}
                      onChange={(e) => setScheduleEnabled(e.target.checked)}
                    />
                    사용
                  </label>
                </div>
                {scheduleEnabled && (
                  <div className="flex flex-col gap-3">
                    <div className="flex gap-3">
                      <div className="relative flex-1" ref={datePickerRef}>
                        <button
                          type="button"
                          onClick={() => {
                            setIsDatePickerOpen((prev) => {
                              const next = !prev;
                              if (next) {
                                const base = scheduleDate
                                  ? parseDateString(scheduleDate)
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
                                {scheduleDate ? scheduleDate.replace(/-/g, '. ') : '날짜 선택'}
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
                                const isSelected = scheduleDate === formatted;
                                return (
                                  <button
                                    key={`${formatted}-${index}`}
                                    type="button"
                                    disabled={cell.isDisabled}
                                    onClick={() => {
                                      setScheduleDate(formatted);
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
                                  setScheduleDate(formatDateString(today));
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
                                {formatDisplayTime(scheduleTime)}
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
                                      scheduleTime &&
                                      Number(scheduleTime.split(':')[0]) === hour;
                                    return (
                                      <li key={hour}>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const minute = scheduleTime
                                              ? Number(scheduleTime.split(':')[1])
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
                                      scheduleTime &&
                                      Number(scheduleTime.split(':')[1]) === minute;
                                    return (
                                      <li key={minute}>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const hour = scheduleTime
                                              ? Number(scheduleTime.split(':')[0])
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
                    <p className="text-sm text-[#f5f5f5]/40">
                      예약 시간은 한국 표준시(KST) 기준으로 설정됩니다.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex flex-wrap justify-center gap-4 p-4 border-t border-[#3a3b50]">
          {currentStep === 1 ? (
            <>
              <button
                onClick={onClose}
                className="bg-[#1c1c28] border border-[#3a3b50] rounded-[16px] px-8 py-4 text-[18px] font-medium text-[#f5f5f5]/60 hover:text-[#f5f5f5] transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  if (!isStep1Valid) return;
                  setCurrentStep(2);
                }}
                disabled={!isStep1Valid}
                className={`rounded-[16px] px-8 py-4 text-[18px] font-medium transition-colors ${
                  isStep1Valid
                    ? 'bg-[#ff8953]/40 border border-[#ff8953]/40 text-[#ff8953] hover:bg-[#ff8953]/60'
                    : 'bg-[#ff8953]/20 border border-[#ff8953]/20 text-[#ff8953]/40 cursor-not-allowed'
                }`}
              >
                다음으로
              </button>
              {!isStep1Valid && (
                <p className="basis-full text-center text-[14px] text-[#ff8953]/80">
                  동영상 파일, 제목, 설명을 모두 입력하면 다음 단계로 진행할 수 있습니다.
                </p>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-[#1c1c28] border border-[#3a3b50] rounded-[16px] px-8 py-4 text-[18px] font-medium text-[#f5f5f5]/60 hover:text-[#f5f5f5] transition-colors"
              >
                뒤로가기
              </button>
              <button
                onClick={async () => {
                  if (!videoFile) {
                    error('업로드 준비 필요', '동영상 파일을 선택해주세요.');
                    return;
                  }

                  try {
                    setIsUploading(true);
                    setProgress(null);

                    const accessToken = getAccessToken();
                    if (!accessToken) {
                      error('YouTube 연결 필요', 'YouTube 계정을 연결한 뒤 다시 시도해주세요.');
                      setIsUploading(false);
                      return;
                    }

                    // 1) 업로드 세션 생성
                    const startRes = await fetch('/api/youtube/upload/start', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                      },
                      body: JSON.stringify({
                        title,
                        description,
                        categoryId: '22',
                        tags: tags.map(t => t.text),
                        privacyStatus: scheduleEnabled ? 'private' : privacy,
                        publishAt: scheduleEnabled && scheduleDate && scheduleTime
                          ? new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString()
                          : undefined,
                      }),
                    });
                    if (!startRes.ok) {
                      const text = await startRes.text();
                      throw new Error(text);
                    }
                    const { uploadUrl } = await startRes.json();

                    // 2) 비디오 업로드 (서버 프록시 + 진행률)
                    const form = new FormData();
                    form.append('uploadUrl', uploadUrl);
                    form.append('file', videoFile);
                    form.append('contentType', videoFile.type || 'video/*');

                    const proxyUrl = '/api/youtube/upload/video/put';
                    const proxyResponseText = await new Promise<string>((resolve, reject) => {
                      const xhr = new XMLHttpRequest();
                      xhr.open('POST', proxyUrl);
                      xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                          const percent = Math.floor((event.loaded / event.total) * 100);
                          setProgress(percent);
                        }
                      };
                      xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                          resolve(xhr.responseText || '{}');
                        } else {
                          reject(new Error(`Proxy upload failed (${xhr.status}): ${xhr.responseText}`));
                        }
                      };
                      xhr.onerror = () => reject(new Error('Network error during proxy upload'));
                      xhr.send(form);
                    });
                    const videoResource = JSON.parse(proxyResponseText || '{}');

                    // 3) 썸네일 업로드 (선택)
                    if (thumbnailFile) {
                      const thumbStartRes = await fetch('/api/youtube/upload/thumbnail/start', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${accessToken}`,
                        },
                        body: JSON.stringify({ videoId: videoResource.id, mimeType: thumbnailFile.type }),
                      });
                      if (!thumbStartRes.ok) {
                        console.warn('썸네일 업로드 세션 생성 실패:', await thumbStartRes.text());
                      } else {
                        const { uploadUrl: thumbUrl } = await thumbStartRes.json();
                        try {
                          const thumbForm = new FormData();
                          thumbForm.append('uploadUrl', thumbUrl);
                          thumbForm.append('file', thumbnailFile);
                          thumbForm.append('contentType', thumbnailFile.type || 'image/*');

                          await new Promise<void>((resolve, reject) => {
                            const xhr = new XMLHttpRequest();
                            xhr.open('POST', '/api/youtube/upload/thumbnail/put');
                            xhr.upload.onprogress = (event) => {
                              if (event.lengthComputable) {
                                const percent = Math.floor((event.loaded / event.total) * 100);
                                setProgress(percent);
                              }
                            };
                            xhr.onload = () => {
                              if (xhr.status >= 200 && xhr.status < 300) resolve();
                              else reject(new Error(`Proxy thumbnail upload failed (${xhr.status})`));
                            };
                            xhr.onerror = () => reject(new Error('Network error during proxy thumbnail upload'));
                            xhr.send(thumbForm);
                          });
                        } catch (e) {
                          console.warn('썸네일 업로드 실패:', e);
                        }
                      }
                    }

                    success('업로드 완료', scheduleEnabled ? '동영상 예약 업로드가 완료되었습니다.' : '동영상 업로드가 완료되었습니다.');
                    resetForm();
                    onClose();
                  } catch (err) {
                    console.error(err);
                    const errorMessage = err instanceof Error ? err.message : '업로드 중 오류가 발생했습니다. 콘솔을 확인해주세요.';
                    error('업로드 실패', errorMessage);
                  } finally {
                    setIsUploading(false);
                    setProgress(null);
                  }
                }}
                disabled={isUploading}
                className="bg-[#ff8953]/40 border border-[#ff8953]/40 rounded-[16px] px-8 py-4 text-[18px] font-medium text-[#ff8953] hover:bg-[#ff8953]/60 transition-colors disabled:opacity-60"
              >
                {isUploading ? `업로드 중...${progress !== null ? ` ${progress}%` : ''}` : '예약하기'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
