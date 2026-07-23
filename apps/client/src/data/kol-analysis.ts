import type { KolAnalysisWeights } from '@/features/kol-analysis/types';

export const KOL_ANALYSIS_WEIGHTS: KolAnalysisWeights = {
  sentiment: 0.35,
  engagement: 0.3,
  topic: 0.2,
  risk: 0.15,
};

export const KOL_ANALYSIS_NICHES = [
  'Gaming',
  'Beauty',
  'Tech',
  'Education',
  'Lifestyle',
  'Finance',
] as const;

export const KOL_ANALYSIS_PLATFORMS = [
  'TikTok',
  'YouTube',
  'Facebook',
  'Threads',
  'Instagram',
] as const;

export const KOL_ANALYSIS_NAMES = [
  'Chi Pu',
  'ViruSs',
  'MisThy',
  'Hana Giang Anh',
  'Giang Oi',
  'HuyR',
  'Long Chun',
  'Ninh Tito',
  'Khoa Pug',
  'Khoai Lang Thang',
  'Woossi',
  'Dino Vu',
  'Trinh Pham',
  'Quang Linh Vlogs',
  'Thay Giao Ba',
  'Nguyen Huu Tri',
  'Ha Truc',
  'Vietcetera',
] as const;

export const KOL_ANALYSIS_SEED = 42;

export const PIPELINE_STEPS = [
  {
    id: 'crawl-data',
    title: '0. crawl data',
    summary: 'Current crawler focuses on Threads and receives manual link input.',
    details: 'Previous pipeline version primarily targeted comment-based public opinion analysis.',
  },
  {
    id: 'data-collecting',
    title: '1. data_collecting.py',
    summary: 'Normalizes schema from JSONL inputs into a stable, model-ready format.',
    details: 'Designed to support future expansion into multi-platform collection.',
  },
  {
    id: 'data-processing',
    title: '2. data_processing.py',
    summary: 'Cleans spam/noise records and removes structurally low-signal content.',
    details: 'Normalizes teencode and slang using a dictionary mapping layer.',
  },
  {
    id: 'semantic-understanding',
    title: '3. semantic_understanding.py',
    summary: 'Generates PhoBERT embeddings for semantic representation.',
    details:
      'Embedding similarity supports sentiment inference, topic mapping, and entity signals.',
  },
  {
    id: 'evaluation',
    title: '4. evaluation.py',
    summary: 'Combines sentiment, engagement quality, topic authority, and controversy risk.',
    details: 'Outputs the weighted KOL Score used for ranking and comparison.',
  },
  {
    id: 'run-pipeline',
    title: '5. run_pipeline.py',
    summary: 'Executes the end-to-end pipeline from ingestion to final scoring artifacts.',
    details: 'This stage packages the analysis output for dashboard consumption.',
  },
] as const;

export const METRIC_GUIDE = [
  {
    title: 'Sentiment Score',
    tone: 'good',
    description:
      '> 0 indicates positive sentiment dominates negative sentiment in analyzed conversations.',
  },
  {
    title: 'Engagement Quality',
    tone: 'good',
    description:
      'Combines interaction volume and interaction quality from comments, replies, and saves.',
  },
  {
    title: 'Topic Authority',
    tone: 'good',
    description: 'Measured as dominant topic frequency divided by total topic frequency.',
  },
  {
    title: 'Controversy Risk',
    tone: 'warn',
    description: 'Lower risk is better and interpreted as safer brand collaboration potential.',
  },
  {
    title: 'KOL Score',
    tone: 'neutral',
    description:
      'Weighted combination of sentiment, engagement quality, topic authority, and controversy safety.',
  },
] as const;
