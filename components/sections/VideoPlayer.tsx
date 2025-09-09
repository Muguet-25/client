"use client";

import { useRef, useState } from "react";

interface VideoPlayerProps {
  src: string;
  className?: string;
}

const VideoPlayer = ({ src, className = "" }: VideoPlayerProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  return (
    <div className="flex flex-col items-center mb-16">
      <button 
        onClick={handleVideoPlay}
        className="group relative w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mb-6 hover:bg-orange-600 transition-all duration-300 hover:scale-110 shadow-2xl hover:shadow-orange-500/25"
      >
        {isVideoPlaying ? (
          <div className="w-6 h-6 bg-white rounded-sm"></div>
        ) : (
          <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
        )}
      </button>
      <p className="text-white/80 text-lg font-medium">{isVideoPlaying ? '일시정지' : '데모 영상 보기'}</p>
      <div className="w-32 h-0.5 bg-orange-500 mt-2"></div>
      
      <video
        ref={videoRef}
        src={src}
        muted 
        loop 
        playsInline
        className={`absolute top-0 left-0 w-full h-full object-cover ${className}`}
      />
    </div>
  );
};

export default VideoPlayer;
