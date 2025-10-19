'use client';

import { useState } from 'react';
import { X, CloudUpload, ArrowUp, Sun } from 'lucide-react';
import { WithContext as ReactTags } from 'react-tag-input';

const KeyCodes = { comma: 188, enter: 13 };
const delimiters = [KeyCodes.comma, KeyCodes.enter];

interface VideoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VideoUploadModal({ isOpen, onClose }: VideoUploadModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [tags, setTags] = useState<Array<{id: string, text: string}>>([]);
  const [category, setCategory] = useState('노하우, 스타일');

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
              <div className="bg-[#12121e] border border-[#3a3b50] rounded-[16px] p-4">
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="bg-[#26273c] rounded-[12px] w-[64px] h-[64px] flex items-center justify-center mb-3">
                    <CloudUpload className="w-12 h-12 text-[#f5f5f5]/60" />
                  </div>
                  <div className="text-center">
                    <p className="text-[18px] font-semibold text-[#f5f5f5]/60 mb-1">
                      여기에 동영상을 업로드 해주세요.
                    </p>
                    <p className="text-[14px] font-semibold text-[#f5f5f5]/40">
                      영상 최대 사이즈 256GB
                    </p>
                  </div>
                </div>
              </div>

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
              <div className="bg-[#12121e] border border-[#3a3b50] rounded-[16px] p-4">
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="bg-[#26273c] rounded-[12px] w-[64px] h-[64px] flex items-center justify-center mb-3">
                    <ArrowUp className="w-12 h-12 text-[#f5f5f5]/60" />
                  </div>
                  <div className="text-center">
                    <p className="text-[18px] font-semibold text-[#f5f5f5]/60 mb-1">
                      여기에 동영상 썸네일을 업로드 해주세요.
                    </p>
                    <p className="text-[14px] font-semibold text-[#f5f5f5]/40">
                      JPG, PNG 형식의 2MB 이하 이미지 (최소 너비 640px)
                    </p>
                  </div>
                </div>
              </div>

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
                <label className="block text-[16px] text-[#f5f5f5]/60 mb-2">
                  업로드 예약일
                </label>
                <div className="flex gap-3">
                  <div className="bg-[#12121e] border border-[#3a3b50] rounded-[16px] px-6 py-4 flex items-center gap-2">
                    <span className="text-[#f5f5f5]/60">2025년</span>
                  </div>
                  <div className="bg-[#12121e] border border-[#3a3b50] rounded-[16px] px-6 py-4 flex items-center gap-2">
                    <span className="text-[#f5f5f5]/60">11월</span>
                  </div>
                  <div className="bg-[#12121e] border border-[#3a3b50] rounded-[16px] px-6 py-4 flex items-center gap-2">
                    <span className="text-[#f5f5f5]/60">23일</span>
                  </div>
                  <div className="bg-[#12121e] border border-[#3a3b50] rounded-[16px] px-6 py-4 flex items-center gap-2">
                    <span className="text-[#f5f5f5]/60">06시</span>
                  </div>
                  <div className="bg-[#12121e] border border-[#3a3b50] rounded-[16px] px-6 py-4 flex items-center gap-2">
                    <span className="text-[#f5f5f5]/60">00분</span>
                  </div>
                  <div className="bg-[#12121e] border border-[#3a3b50] rounded-[16px] px-6 py-4 flex items-center gap-2">
                    <span className="text-[#f5f5f5]/60">오후</span>
                    <Sun className="w-5 h-5 text-[#ff8953]/50" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-center gap-4 p-4 border-t border-[#3a3b50]">
          {currentStep === 1 ? (
            <>
              <button
                onClick={onClose}
                className="bg-[#1c1c28] border border-[#3a3b50] rounded-[16px] px-8 py-4 text-[18px] font-medium text-[#f5f5f5]/60 hover:text-[#f5f5f5] transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-[#ff8953]/40 border border-[#ff8953]/40 rounded-[16px] px-8 py-4 text-[18px] font-medium text-[#ff8953] hover:bg-[#ff8953]/60 transition-colors"
              >
                다음으로
              </button>
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
                onClick={() => {
                  // 예약하기 로직
                  console.log('예약하기 완료');
                  onClose();
                }}
                className="bg-[#ff8953]/40 border border-[#ff8953]/40 rounded-[16px] px-8 py-4 text-[18px] font-medium text-[#ff8953] hover:bg-[#ff8953]/60 transition-colors"
              >
                예약하기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
