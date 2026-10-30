import type { BatchPredictionResponse, ListingInput, PredictionResponse } from '@/types/api'
import { postJson } from './client'

export function predecir(listing: ListingInput, signal?: AbortSignal): Promise<PredictionResponse> {
  return postJson<PredictionResponse>('/api/v1/predict', listing, signal)
}

export function predecirLote(
  listings: ListingInput[],
  signal?: AbortSignal,
): Promise<BatchPredictionResponse> {
  return postJson<BatchPredictionResponse>('/api/v1/predict/batch', { listings }, signal)
}
