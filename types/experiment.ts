// 실험(Experiment) 타입 정의

export type ExperimentType = 'title' | 'thumbnail' | 'upload_time' | 'content_length' | 'other';

export type ExperimentStatus = 'draft' | 'running' | 'completed' | 'cancelled';

export interface Experiment {
  id: string;
  name: string;
  type: ExperimentType;
  description?: string;
  status: ExperimentStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  variants: ExperimentVariant[];
  metrics: ExperimentMetrics;
  hypothesis?: string;
  conclusion?: string;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description?: string;
  // 타입별 데이터
  data: {
    // title 실험의 경우
    title?: string;
    // thumbnail 실험의 경우
    thumbnailUrl?: string;
    // upload_time 실험의 경우
    uploadTime?: string;
    // content_length 실험의 경우
    duration?: string;
    // 기타
    [key: string]: any;
  };
  videoIds?: string[]; // 이 variant를 사용한 영상 ID들
}

export interface ExperimentMetrics {
  views: number;
  ctr: number;
  avgWatchDuration: number;
  engagement: number;
  subscriberGain: number;
  // 기타 메트릭
  [key: string]: number;
}

export interface ExperimentComparison {
  experimentId: string;
  variantA: {
    id: string;
    metrics: ExperimentMetrics;
  };
  variantB: {
    id: string;
    metrics: ExperimentMetrics;
  };
  winner?: string; // variant ID
  confidence: number; // 0-100
}

