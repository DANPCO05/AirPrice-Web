import type { ModelInfo, PriceRange } from '@/types/api'

export interface DatasetInfo {
  target: string
  split: string
  seed: number
  n_train: number
  n_val: number
  n_test: number
}

export interface PerClassMetric {
  label: PriceRange
  precision: number
  recall: number
  f1: number
  support: number
}

export interface ConfusionMatrix {
  labels: PriceRange[]
  matrix: number[][]
}

export interface RocData {
  labels: PriceRange[]
  fpr: Record<string, number[]>
  tpr: Record<string, number[]>
  auc: Record<string, number>
}

export interface FeatureImportance {
  rank: number
  feature: string
  importance: number
}

export interface ModelComparison {
  model: string
  scenario: string
  accuracy: number
  balanced_accuracy: number
  f1_macro: number
  f1_weighted: number
  accuracy_adjacent: number
  mae_ordinal: number
  qwk: number
}

export interface EvaluationResponse {
  schema_version: string
  generated_at: string
  model: ModelInfo
  dataset: DatasetInfo
  metrics: Record<string, number>
  per_class: PerClassMetric[]
  confusion_matrix: ConfusionMatrix
  roc: RocData
  feature_importance: FeatureImportance[]
  model_comparison: ModelComparison[]
  metric_notes: Record<string, string>
  limitations: string[]
}
