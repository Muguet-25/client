// YouTube API 타입 정의
export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  publishedAt: string;
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
  };
  statistics: {
    viewCount: string;
    subscriberCount: string;
    videoCount: string;
  };
  brandingSettings: {
    channel: {
      title: string;
      description: string;
      keywords: string;
    };
  };
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  duration: string; // ISO 8601 duration format (PT4M13S)
  thumbnails: {
    default: { url: string; width: number; height: number };
    medium: { url: string; width: number; height: number };
    high: { url: string; width: number; height: number };
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
  status: {
    privacyStatus: 'public' | 'private' | 'unlisted';
    uploadStatus: 'processed' | 'uploaded' | 'failed';
  };
  snippet: {
    channelId: string;
    channelTitle: string;
    categoryId: string;
    tags: string[];
  };
}

export interface YouTubeAnalytics {
  views: number;
  estimatedMinutesWatched: number;
  averageViewDuration: string;
  subscribersGained: number;
  subscribersLost: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  estimatedRevenue: number;
  cpm: number;
  /**
   * CTR 및 노출 데이터는 reach 리포트에서 별도로 계산됨
   * getChannelAnalytics 호출에서는 기본값(0)으로 유지됨
   */
  ctr?: number;
  impressions?: number;
  impressionsClickable?: number;
}

export interface YouTubeAnalyticsData {
  date: string;
  views: number;
  estimatedMinutesWatched: number;
  averageViewDuration: number;
  subscribersGained: number;
  subscribersLost: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  estimatedRevenue: number;
}

export interface YouTubeAgeGroupData {
  ageGroup: string;
  percentage: number;
}

export interface YouTubeError {
  error: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}

export interface YouTubeReachAnalyticsRow {
  date: string;
  impressions: number;
  impressionsCtr: number;
  impressionsViewerPercentage: number;
  views: number;
}

export interface YouTubeReachAnalytics {
  totalImpressions: number;
  averageCtr: number;
  averageViewerPercentage: number;
  totalViews: number;
  rows: YouTubeReachAnalyticsRow[];
}
