import type { EvaluationResponse } from '@/features/model/types'
import type { HealthResponse, ModelInfo } from '@/types/api'
import { getJson } from './client'

export function obtenerSalud(signal?: AbortSignal): Promise<HealthResponse> {
  return getJson<HealthResponse>('/health', signal)
}

export function obtenerInfoModelo(signal?: AbortSignal): Promise<ModelInfo> {
  return getJson<ModelInfo>('/api/v1/model/info', signal)
}

// Endpoint previsto para la siguiente versión de la API.
// Mientras no exista, la página de modelo usa datos simulados.
export function obtenerEvaluacion(signal?: AbortSignal): Promise<EvaluationResponse> {
  return getJson<EvaluationResponse>('/api/v1/model/evaluation', signal)
}
